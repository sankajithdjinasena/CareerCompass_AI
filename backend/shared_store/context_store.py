import json
import sqlite3
import threading
from pathlib import Path
from typing import Any, Dict, List, Optional

DB_PATH = Path(__file__).resolve().parent.parent / "data" / "context_store.db"


class ContextStore:
    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()
        self._init_db()

    def _connect(self) -> sqlite3.Connection:
        # A short-lived connection per call keeps this safe to use from
        # FastAPI's background tasks without worrying about sharing a
        # single sqlite3 connection across threads.
        conn = sqlite3.connect(self.db_path)
        conn.execute("PRAGMA journal_mode=WAL;")
        return conn

    def _init_db(self) -> None:
        with self._lock, self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS sessions (
                    session_id TEXT PRIMARY KEY,
                    data TEXT NOT NULL
                )
                """
            )
            conn.commit()

    # ------------------------------------------------------------------
    # internal helpers
    # ------------------------------------------------------------------

    def _read(self, conn: sqlite3.Connection, session_id: str) -> Optional[Dict[str, Any]]:
        row = conn.execute(
            "SELECT data FROM sessions WHERE session_id = ?", (session_id,)
        ).fetchone()
        if row is None:
            return None
        return json.loads(row[0])

    def _write(self, conn: sqlite3.Connection, session_id: str, session: Dict[str, Any]) -> None:
        conn.execute(
            """
            INSERT INTO sessions (session_id, data) VALUES (?, ?)
            ON CONFLICT(session_id) DO UPDATE SET data = excluded.data
            """,
            (session_id, json.dumps(session)),
        )
        conn.commit()

    # ------------------------------------------------------------------
    # public interface — unchanged from the in-memory version
    # ------------------------------------------------------------------

    def create_session(self, session_id: str, **initial: Any) -> Dict[str, Any]:
        with self._lock, self._connect() as conn:
            session = dict(initial)
            self._write(conn, session_id, session)
            return session

    def exists(self, session_id: str) -> bool:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT 1 FROM sessions WHERE session_id = ?", (session_id,)
            ).fetchone()
            return row is not None

    def get(self, session_id: str) -> Optional[Dict[str, Any]]:
        with self._connect() as conn:
            return self._read(conn, session_id)

    def get_field(self, session_id: str, key: str, default: Any = None) -> Any:
        session = self.get(session_id)
        if session is None:
            return default
        return session.get(key, default)

    def update(self, session_id: str, **fields: Any) -> Dict[str, Any]:
        with self._lock, self._connect() as conn:
            session = self._read(conn, session_id) or {}
            session.update(fields)
            self._write(conn, session_id, session)
            return session

    def append_error(self, session_id: str, message: str) -> None:
        with self._lock, self._connect() as conn:
            session = self._read(conn, session_id) or {}
            session.setdefault("errors", []).append(message)
            self._write(conn, session_id, session)

    def list_errors(self, session_id: str) -> List[str]:
        return self.get_field(session_id, "errors", [])

    def all_sessions(self) -> Dict[str, Dict[str, Any]]:
        """Mostly for debugging/admin use — avoid relying on this in request paths."""
        with self._connect() as conn:
            rows = conn.execute("SELECT session_id, data FROM sessions").fetchall()
            return {sid: json.loads(data) for sid, data in rows}


# Module-level singleton, same as before — one store shared across the
# whole API process. Only difference from the caller's point of view:
# this one survives `uvicorn --reload` and full restarts.
context_store = ContextStore()