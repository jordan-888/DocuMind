from fastapi import APIRouter, Header
from typing import Optional
import os
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/debug/auth")
async def debug_auth(authorization: Optional[str] = Header(None)):
    """
    Debug endpoint to check authentication configuration.
    This helps diagnose JWT authentication issues.
    """
    from app.core.config import settings
    
    debug_info = {
        "auth_header_received": authorization is not None,
        "auth_header_format": "Bearer token" if authorization and authorization.startswith("Bearer ") else "invalid or missing",
        "env_vars_loaded": {
            "SUPABASE_URL": bool(settings.SUPABASE_URL),
            "SUPABASE_KEY": bool(settings.SUPABASE_KEY),
            "SUPABASE_JWT_SECRET": bool(settings.SUPABASE_JWT_SECRET),
        },
        "env_vars_values": {
            "SUPABASE_URL": settings.SUPABASE_URL if settings.SUPABASE_URL else "NOT SET",
            "SUPABASE_KEY": settings.SUPABASE_KEY[:20] + "..." if settings.SUPABASE_KEY else "NOT SET",
            "SUPABASE_JWT_SECRET": settings.SUPABASE_JWT_SECRET[:20] + "..." if settings.SUPABASE_JWT_SECRET else "NOT SET",
        }
    }
    
    # Try to validate token if provided
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        debug_info["token_received"] = True
        debug_info["token_length"] = len(token)
        
        try:
            from app.services.auth import get_supabase_client
            supabase_client = get_supabase_client()
            
            if supabase_client:
                try:
                    user_response = supabase_client.auth.get_user(token)
                    debug_info["token_validation"] = "SUCCESS"
                    debug_info["user_id"] = str(user_response.user.id) if user_response and user_response.user else "No user"
                except Exception as e:
                    debug_info["token_validation"] = "FAILED"
                    debug_info["validation_error"] = str(e)
            else:
                debug_info["token_validation"] = "SKIPPED - Supabase client unavailable"
        except Exception as e:
            debug_info["token_validation_error"] = str(e)
    else:
        debug_info["token_received"] = False
    
    logger.info(f"Debug auth info: {debug_info}")
    return debug_info
