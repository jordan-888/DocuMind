from fastapi import APIRouter, Depends
from typing import Any
from app.services.auth import auth_service
from app.models.schemas import User
from gotrue import User as SupabaseUser

router = APIRouter()

# NOTE: With Supabase, user registration and login are typically handled on the
# client-side using the Supabase JS library. The backend's role is to validate
# the JWT token that the client sends. Therefore, the /register and /login
# endpoints are not needed here.

@router.get("/me", response_model=User)
async def read_users_me(
    # CORRECTED: Use the get_current_user method from the auth_service instance
    current_user: SupabaseUser = Depends(auth_service.get_current_user)
) -> Any:
    """
    Get current authenticated user's information.
    """
    # Handle both dict (test) and SupabaseUser object formats
    if isinstance(current_user, dict):
        return {
            "id": current_user.get("id"),
            "email": current_user.get("email"),
        }
    
    # The Supabase user object can be mapped to your Pydantic User schema.
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        # Add other fields as needed, e.g., created_at
    }
