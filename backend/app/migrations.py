"""Lightweight idempotent migrations for additive schema changes.

`Base.metadata.create_all` only creates missing tables — it never alters
existing ones. Until the project adopts Alembic, additive column changes
go here so existing databases keep working across upgrades.
"""
from sqlalchemy import text

from app.database import engine

_MIGRATIONS = [
    'ALTER TABLE events ADD COLUMN IF NOT EXISTS flag_format VARCHAR(32)',
]


def run_migrations() -> None:
    with engine.begin() as conn:
        for statement in _MIGRATIONS:
            conn.execute(text(statement))
