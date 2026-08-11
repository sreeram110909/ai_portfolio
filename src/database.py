import sqlite3
import os
from pathlib import Path
from typing import Optional, Dict, Any

DB_PATH = Path(os.getenv("DATABASE_PATH", "users.db"))


def get_db_connection() -> sqlite3.Connection:
    """Returns a SQLite connection with row factory enabled."""
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initializes the database schema if not already present."""
    with get_db_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                hashed_password TEXT NOT NULL,
                name TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        conn.commit()


# Run initialization on import
init_db()


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Fetches a user record by email."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, hashed_password, name, created_at FROM users WHERE lower(email) = lower(?)", (email.strip(),))
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None


def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    """Fetches a user record by id."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, hashed_password, name, created_at FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None


def create_user(email: str, hashed_password: str, name: Optional[str] = None) -> Dict[str, Any]:
    """Creates a new user record and returns the user dict."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (email, hashed_password, name) VALUES (?, ?, ?)",
            (email.strip().lower(), hashed_password, name or email.split("@")[0]),
        )
        conn.commit()
        user_id = cursor.lastrowid
        return {
            "id": user_id,
            "email": email.strip().lower(),
            "name": name or email.split("@")[0],
        }
