"""Initialize database and create first migrations

Usage:
    python scripts/init_db.py
"""
import os
import sys
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from app.services.database import init_db
from app.core.config import settings

def main():
    print("Creating database tables...")
    init_db()
    print("Database initialization completed!")

if __name__ == "__main__":
    main()