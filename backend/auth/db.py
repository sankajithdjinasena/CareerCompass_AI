"""
auth/db.py
----------
SQLite-backed auth database.

Tables:
  users         — registered users (email/password OR Google OAuth)
  auth_sessions — active session tokens (30-day TTL)

Columns added (v2):
  users.target_role  — user's primary career target role (text)
  users.skills       — JSON-serialised list of user skills (text)
"""

import json
import sqlite3
import threading
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

DB_PATH = Path(__file__).resolve().parent.parent / "data" / "auth.db"

SESSION_TTL_DAYS = 30


class AuthDB:
    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()
        self._init_db()

    # ------------------------------------------------------------------
    # Connection
    # ------------------------------------------------------------------

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA foreign_keys=ON;")
        return conn

    # ------------------------------------------------------------------
    # Schema bootstrap
    # ------------------------------------------------------------------

    def _init_db(self) -> None:
        with self._lock, self._connect() as conn:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id          TEXT PRIMARY KEY,
                    email       TEXT UNIQUE NOT NULL,
                    name        TEXT,
                    picture     TEXT,
                    hashed_pw   TEXT,
                    provider    TEXT NOT NULL DEFAULT 'email',
                    google_id   TEXT UNIQUE,
                    created_at  TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS auth_sessions (
                    token       TEXT PRIMARY KEY,
                    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    created_at  TEXT NOT NULL,
                    expires_at  TEXT NOT NULL
                );
                """
            )
            # Migrate existing DBs — ADD COLUMN is a no-op if column already exists
            for alter_sql in [
                "ALTER TABLE users ADD COLUMN target_role TEXT",
                "ALTER TABLE users ADD COLUMN skills      TEXT",
            ]:
                try:
                    conn.execute(alter_sql)
                except Exception:
                    pass  # Column already exists
            conn.commit()

    # ------------------------------------------------------------------
    # User helpers
    # ------------------------------------------------------------------

    def _deserialize_user(self, row) -> Optional[dict]:
        """Convert a DB row to a dict, deserialising JSON fields."""
        if row is None:
            return None
        d = dict(row)
        if d.get("skills"):
            try:
                d["skills"] = json.loads(d["skills"])
            except Exception:
                d["skills"] = []
        else:
            d["skills"] = []
        return d

    def get_user_by_email(self, email: str) -> Optional[dict]:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT * FROM users WHERE email = ?", (email,)
            ).fetchone()
            return self._deserialize_user(row)

    def get_user_by_google_id(self, google_id: str) -> Optional[dict]:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT * FROM users WHERE google_id = ?", (google_id,)
            ).fetchone()
            return self._deserialize_user(row)

    def get_user_by_id(self, user_id: str) -> Optional[dict]:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT * FROM users WHERE id = ?", (user_id,)
            ).fetchone()
            return self._deserialize_user(row)

    def create_user(
        self,
        email: str,
        name: Optional[str] = None,
        picture: Optional[str] = None,
        hashed_pw: Optional[str] = None,
        provider: str = "email",
        google_id: Optional[str] = None,
        target_role: Optional[str] = None,
        skills: Optional[list] = None,
    ) -> dict:
        user_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()
        skills_json = json.dumps(skills) if skills else None
        with self._lock, self._connect() as conn:
            conn.execute(
                """
                INSERT INTO users (id, email, name, picture, hashed_pw, provider, google_id, created_at, target_role, skills)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (user_id, email, name, picture, hashed_pw, provider, google_id, created_at, target_role, skills_json),
            )
            conn.commit()
        return self.get_user_by_id(user_id)

    def upsert_google_user(
        self,
        google_id: str,
        email: str,
        name: Optional[str],
        picture: Optional[str],
    ) -> dict:
        """Create or update a Google-authenticated user."""
        existing = self.get_user_by_google_id(google_id)
        if existing:
            # Update name/picture in case they changed
            with self._lock, self._connect() as conn:
                conn.execute(
                    "UPDATE users SET name = ?, picture = ? WHERE google_id = ?",
                    (name, picture, google_id),
                )
                conn.commit()
            return self.get_user_by_google_id(google_id)

        # Maybe the email already exists (linked via email auth before)
        existing_email = self.get_user_by_email(email)
        if existing_email:
            with self._lock, self._connect() as conn:
                conn.execute(
                    "UPDATE users SET google_id = ?, picture = ?, provider = 'google', name = ? WHERE email = ?",
                    (google_id, picture, name, email),
                )
                conn.commit()
            return self.get_user_by_email(email)

        return self.create_user(
            email=email,
            name=name,
            picture=picture,
            provider="google",
            google_id=google_id,
        )

    def update_user_profile(
        self,
        user_id: str,
        name: str,
        target_role: Optional[str] = None,
        skills: Optional[list] = None,
    ) -> dict:
        skills_json = json.dumps(skills) if skills is not None else None
        with self._lock, self._connect() as conn:
            if skills_json is not None:
                conn.execute(
                    "UPDATE users SET name = ?, target_role = ?, skills = ? WHERE id = ?",
                    (name, target_role, skills_json, user_id),
                )
            else:
                conn.execute(
                    "UPDATE users SET name = ?, target_role = ? WHERE id = ?",
                    (name, target_role, user_id),
                )
            conn.commit()
        return self.get_user_by_id(user_id)

    def update_user_password(self, user_id: str, hashed_pw: str) -> dict:
        with self._lock, self._connect() as conn:
            conn.execute(
                "UPDATE users SET hashed_pw = ? WHERE id = ?",
                (hashed_pw, user_id),
            )
            conn.commit()
        return self.get_user_by_id(user_id)

    # ------------------------------------------------------------------
    # Session helpers
    # ------------------------------------------------------------------

    def create_session(self, user_id: str) -> str:
        token = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        expires = now + timedelta(days=SESSION_TTL_DAYS)
        with self._lock, self._connect() as conn:
            conn.execute(
                """
                INSERT INTO auth_sessions (token, user_id, created_at, expires_at)
                VALUES (?, ?, ?, ?)
                """,
                (token, user_id, now.isoformat(), expires.isoformat()),
            )
            conn.commit()
        return token

    def get_session(self, token: str) -> Optional[dict]:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT * FROM auth_sessions WHERE token = ?", (token,)
            ).fetchone()
            if row is None:
                return None
            session = dict(row)
            # Check expiry
            expires_at = datetime.fromisoformat(session["expires_at"])
            if datetime.now(timezone.utc) > expires_at:
                self.delete_session(token)
                return None
            return session

    def delete_session(self, token: str) -> None:
        with self._lock, self._connect() as conn:
            conn.execute("DELETE FROM auth_sessions WHERE token = ?", (token,))
            conn.commit()

    def purge_expired_sessions(self) -> int:
        now = datetime.now(timezone.utc).isoformat()
        with self._lock, self._connect() as conn:
            cur = conn.execute(
                "DELETE FROM auth_sessions WHERE expires_at < ?", (now,)
            )
            conn.commit()
            return cur.rowcount


# Module-level singleton
auth_db = AuthDB()
