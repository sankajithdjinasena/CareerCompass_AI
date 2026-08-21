import threading
from typing import Any, Dict, List, Optional


class ContextStore:
    def __init__(self):
        self._sessions: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.Lock()

    def create_session(self, session_id: str, **initial: Any) -> Dict[str, Any]:
        with self._lock:
            self._sessions[session_id] = dict(initial)
            return self._sessions[session_id]

    def exists(self, session_id: str) -> bool:
        return session_id in self._sessions

    def get(self, session_id: str) -> Optional[Dict[str, Any]]:
        return self._sessions.get(session_id)

    def get_field(self, session_id: str, key: str, default: Any = None) -> Any:
        session = self._sessions.get(session_id)
        if session is None:
            return default
        return session.get(key, default)

    def update(self, session_id: str, **fields: Any) -> Dict[str, Any]:
        with self._lock:
            session = self._sessions.setdefault(session_id, {})
            session.update(fields)
            return session

    def append_error(self, session_id: str, message: str) -> None:
        with self._lock:
            session = self._sessions.setdefault(session_id, {})
            session.setdefault("errors", []).append(message)

    def list_errors(self, session_id: str) -> List[str]:
        return self.get_field(session_id, "errors", [])

    def all_sessions(self) -> Dict[str, Dict[str, Any]]:
        """Mostly for debugging/admin use — avoid relying on this in request paths."""
        return self._sessions


# Module-level singleton. One store shared across the whole API process,
# the way `sessions = {}` used to be — just no longer a bare dict that
# every route handler pokes directly.
context_store = ContextStore()