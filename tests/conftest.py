import os
from typing import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy_utils import create_database, database_exists, drop_database
from app.main import app
from app.core.database import Base, get_db
from app.services.auth import auth_service
from app.models.database import User as DBUser
from fpdf import FPDF

# Use PostgreSQL for testing to support all features (like UUID, vector)
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql://Dev@localhost:5432/test_documind"
)

# Create sync engine for the application and management
engine = create_engine(TEST_DATABASE_URL, pool_pre_ping=True)

# Session factory
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# --- Fixtures ---

@pytest.fixture(scope="session")
def test_user_data():
    """Provides consistent test user data."""
    return {
        "id": "00000000-0000-0000-0000-000000000000",
        "email": "test@example.com"
    }


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Set up the test database before any tests run."""
    # Drop and recreate test database using sync URL
    if database_exists(TEST_DATABASE_URL):
        drop_database(TEST_DATABASE_URL)
    create_database(TEST_DATABASE_URL)

    # Ensure pgvector extension is available for tests
    with engine.connect() as connection:
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        connection.commit()

    # Create tables using sync engine
    Base.metadata.create_all(bind=engine)
    
    yield
    
    # Clean up - close all connections first
    engine.dispose()
    try:
        drop_database(TEST_DATABASE_URL)
    except Exception:
        pass  # Database might be in use by other sessions

@pytest.fixture(scope="function")
def test_db(test_user_data: dict) -> Generator[Session, None, None]:
    """Provide a clean database session for each test function with a test user."""
    session = TestingSessionLocal()
    try:
        # Clean all tables first
        for table in reversed(Base.metadata.sorted_tables):
            session.execute(table.delete())
        session.commit()
        
        # Create test user
        test_user = DBUser(
            id=test_user_data["id"],
            email=test_user_data["email"],
            hashed_password="test_password_hash",
            is_active=True
        )
        session.add(test_user)
        session.commit()
        
        yield session
    finally:
        session.rollback()
        session.close()

@pytest.fixture
def client(test_db: Session, test_user_data: dict) -> Generator[TestClient, None, None]:
    """Provide an authenticated TestClient using the Postgres test database."""

    def override_get_db() -> Generator[Session, None, None]:
        try:
            yield test_db
        finally:
            pass

    async def override_get_current_user():
        return test_user_data

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[auth_service.get_current_user] = override_get_current_user

    with TestClient(app, raise_server_exceptions=True) as c:
        yield c

    app.dependency_overrides.clear()

@pytest.fixture(scope="session")
def auth_headers():
    """Provides authorization headers for a mock authenticated user."""
    return {"Authorization": "Bearer test-token"}

@pytest.fixture(scope="session")
def test_pdf():
    """Creates a dummy PDF file for upload tests and cleans it up."""
    pdf_path = "tests/data/test.pdf"
    os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
    
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt="This is a test document.", ln=True, align='C')
    pdf.output(pdf_path)
    
    yield pdf_path
    
    if os.path.exists(pdf_path):
        os.remove(pdf_path)
