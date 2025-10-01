#!/usr/bin/env python3
"""Simple database initialization script"""

import os
import sys
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent
sys.path.append(str(project_root))

from app.core.database import engine
from app.models.database import Base

def init_db():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    # Set environment variables
    os.environ.setdefault("SECRET_KEY", "test-secret-key")
    os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
    os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
    os.environ.setdefault("SUPABASE_KEY", "test-key")
    os.environ.setdefault("SUPABASE_JWT_SECRET", "test-jwt-secret")
    
    init_db()
