import sqlite3
from datetime import datetime, timezone

from ai_agent.config import MEMORY_DB_PATH


def _memory_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(MEMORY_DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            role TEXT,
            content TEXT,
            created_at TEXT
        )
        """
    )
    return conn


def memory_add(user_id: str, role: str, content: str) -> None:
    conn = _memory_conn()
    conn.execute(
        "INSERT INTO chat_messages(user_id, role, content, created_at) VALUES (?, ?, ?, ?)",
        (user_id, role, content, datetime.now(timezone.utc).isoformat()),
    )
    conn.commit()
    conn.close()


def memory_get_recent(user_id: str, limit: int = 10) -> list[tuple[str, str]]:
    conn = _memory_conn()
    rows = conn.execute(
        "SELECT role, content FROM chat_messages WHERE user_id=? ORDER BY id DESC LIMIT ?",
        (user_id, limit),
    ).fetchall()
    conn.close()
    rows.reverse()
    return rows


def memory_clear(user_id: str) -> None:
    conn = _memory_conn()
    conn.execute("DELETE FROM chat_messages WHERE user_id=?", (user_id,))
    conn.commit()
    conn.close()
