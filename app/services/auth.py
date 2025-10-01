from datetime import datetime
from typing import Dict, Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from gotrue import User as SupabaseUser
from supabase import create_client, Client

from app.core.config import settings
from app.models.schemas import ErrorDetail

# These can stay at the module level
security = HTTPBearer()

def get_supabase_client() -> Client:
    """Get Supabase client with lazy initialization"""
    try:
        return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    except Exception:
        # Return a mock client for development/testing
        return None

class AuthError(HTTPException):
    """Custom authentication error with detailed information."""
    def __init__(
        self,
        status_code: int,
        message: str,
        error_code: str,
        **kwargs
    ):
        detail = ErrorDetail(
            message=message,
            code=error_code,
            params=kwargs
        ).dict()
        super().__init__(status_code=status_code, detail=detail)

# --- Start of the AuthService class definition ---
class AuthService:
    """
    Service class for handling authentication logic.
    """
    async def get_current_user(
        self,
        credentials: HTTPAuthorizationCredentials = Depends(security)
    ) -> SupabaseUser:
        """
        Validate JWT token and return Supabase user.
        """
        try:
            supabase_client = get_supabase_client()
            if not supabase_client:
                raise AuthError(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    message="Authentication service unavailable",
                    error_code="SERVICE_UNAVAILABLE"
                )
            user = supabase_client.auth.get_user(credentials.credentials)
            if not user:
                raise AuthError(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    message="User not found",
                    error_code="USER_NOT_FOUND"
                )
            return user
        except Exception as e:
            raise AuthError(
                status_code=status.HTTP_401_UNAUTHORIZED,
                message="Invalid authentication credentials",
                error_code="INVALID_CREDENTIALS",
                error=str(e)
            )

    async def verify_document_access(
        self,
        user: SupabaseUser,
        document_id: str
    ) -> bool:
        """
        Verify if user has access to a document.
        """
        try:
            supabase_client = get_supabase_client()
            if not supabase_client:
                return False  # Allow access if Supabase is unavailable in dev mode
            result = supabase_client.table('documents')\
                .select('id')\
                .eq('id', document_id)\
                .eq('user_id', user.id)\
                .execute()
            return len(result.data) > 0
        except Exception as e:
            raise AuthError(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message="Error verifying document access",
                error_code="ACCESS_CHECK_ERROR",
                error=str(e)
            )

    def get_supabase_client(self) -> Client:
        """Get Supabase client instance"""
        return get_supabase_client()

    def validate_token_expiry(self, token_data: Dict[str, Any]) -> None:
        """
        Validate token expiration.
        """
        try:
            exp = token_data.get('exp')
            if not exp:
                raise AuthError(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    message="Token has no expiration",
                    error_code="TOKEN_NO_EXPIRY"
                )
            exp_datetime = datetime.fromtimestamp(exp)
            if exp_datetime < datetime.utcnow():
                raise AuthError(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    message="Token has expired",
                    error_code="TOKEN_EXPIRED"
                )
        except ValueError as e:
            raise AuthError(
                status_code=status.HTTP_401_UNAUTHORIZED,
                message="Invalid token expiration",
                error_code="INVALID_TOKEN_EXPIRY",
                error=str(e)
            )

# Create a single, reusable instance of the AuthService
auth_service = AuthService()