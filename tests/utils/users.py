"""Test utility functions for user operations."""
from app.models.database import User
from app.services.auth import auth_service
import uuid

def create_test_user(db, email="test@example.com", password="testpassword123"):
    """Create a test user in the database."""
    hashed_password = auth_service.get_password_hash(password)
    user = User(
        id=uuid.uuid4(),
        email=email,
        hashed_password=hashed_password,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user