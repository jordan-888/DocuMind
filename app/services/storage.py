from io import BytesIO
from pathlib import Path
from typing import Optional, Tuple

from supabase import Client, create_client

from app.core.config import settings


DEFAULT_BUCKET = "documents"
SUPABASE_SCHEME = "supabase://"


def get_supabase_client() -> Optional[Client]:
    """Get Supabase client with lazy initialization"""
    try:
        return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    except Exception:
        # Return None for development/testing when Supabase is not available
        return None


def build_supabase_path(bucket: str, key: str) -> str:
    return f"{SUPABASE_SCHEME}{bucket}/{key}"


def is_supabase_path(path: str) -> bool:
    return path.startswith(SUPABASE_SCHEME)


def parse_supabase_path(path: str) -> Tuple[str, str]:
    if not is_supabase_path(path):
        raise ValueError("Path is not a Supabase storage reference")
    remainder = path[len(SUPABASE_SCHEME):]
    if "/" not in remainder:
        raise ValueError("Invalid Supabase storage path format")
    bucket, key = remainder.split("/", 1)
    return bucket, key


def save_document_bytes(
    file_bytes: bytes,
    storage_key: str,
    *,
    content_type: str = "application/pdf",
    bucket: str = DEFAULT_BUCKET,
) -> dict:
    """Persist document bytes to Supabase storage when available, otherwise fallback to local disk."""
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        supabase_client = get_supabase_client()
        use_supabase = settings.STORAGE_PROVIDER.lower() == "supabase" and supabase_client is not None
        
        logger.info(f"Saving document with key: {storage_key}, provider: {settings.STORAGE_PROVIDER}, use_supabase: {use_supabase}")

        if use_supabase:
            try:
                buffer = BytesIO(file_bytes)
                file_options = {"upsert": True}
                if content_type:
                    file_options["content-type"] = content_type

                logger.info(f"Uploading to Supabase bucket: {bucket}, key: {storage_key}")
                supabase_client.storage.from_(bucket).upload(storage_key, buffer, file_options=file_options)
                public_url = supabase_client.storage.from_(bucket).get_public_url(storage_key)
                logger.info(f"Successfully uploaded to Supabase: {public_url}")
                
                return {
                    "provider": "supabase",
                    "path": build_supabase_path(bucket, storage_key),
                    "public_url": public_url,
                }
            except Exception as e:
                logger.error(f"Supabase upload failed: {str(e)}, falling back to local storage")
                # Fall through to local storage on Supabase error
                use_supabase = False

        # Local fallback for development/testing
        if not use_supabase:
            try:
                target_path = Path(settings.UPLOAD_DIR) / storage_key
                logger.info(f"Saving to local path: {target_path}")
                
                # Ensure parent directory exists
                target_path.parent.mkdir(parents=True, exist_ok=True)
                
                # Write file
                target_path.write_bytes(file_bytes)
                logger.info(f"Successfully saved to local storage: {target_path}")

                return {
                    "provider": "local",
                    "path": str(target_path),
                    "public_url": None,
                }
            except Exception as e:
                logger.error(f"Local storage save failed: {str(e)}")
                raise Exception(f"Failed to save file to local storage: {str(e)}")
                
    except Exception as e:
        logger.error(f"Unexpected error in save_document_bytes: {str(e)}")
        raise Exception(f"Storage operation failed: {str(e)}")


def download_supabase_file(storage_path: str) -> Optional[bytes]:
    """Download a file from Supabase storage represented by the storage path."""
    if not is_supabase_path(storage_path):
        raise ValueError("Storage path is not a Supabase reference")

    supabase_client = get_supabase_client()
    if not supabase_client:
        return None

    bucket, key = parse_supabase_path(storage_path)
    response = supabase_client.storage.from_(bucket).download(key)
    if hasattr(response, "read"):
        return response.read()
    return response


def get_file_url(storage_path: str) -> Optional[str]:
    """Retrieve a public URL for a storage path when using Supabase storage."""
    if not is_supabase_path(storage_path):
        return None

    supabase_client = get_supabase_client()
    if not supabase_client:
        return None

    bucket, key = parse_supabase_path(storage_path)
    return supabase_client.storage.from_(bucket).get_public_url(key)