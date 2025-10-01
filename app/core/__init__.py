"""Core module initialization."""

from app.core.config import settings
from app.core.database import init_db

__all__ = ["settings", "init_db"]