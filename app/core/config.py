from typing import List, Optional, Dict, Any
from pydantic_settings import BaseSettings
from pydantic import validator, field_validator
import os
from datetime import timedelta

class Settings(BaseSettings):
    # API Configuration
    PROJECT_NAME: str = "DocuMind"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    PASSWORD_MIN_LENGTH: int = 8
    
    # Database
    DATABASE_URL: str
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_ECHO: bool = False
    
    # Supabase
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_JWT_SECRET: str
    
    # Vector Store
    VECTOR_STORE: str = "pgvector"
    VECTOR_INDEX_TYPE: str = "ivfflat"
    EMBEDDING_DIMENSION: int = 384
    VECTOR_INDEX_LIST_SIZE: int = 100  # IVF-Flat list size
    VECTOR_PROBES: int = 10  # Number of probes for search
    
    # ML Models
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    SUMMARIZATION_MODEL: str = "sshleifer/distilbart-cnn-6-6"
    MODEL_CACHE_DIR: str = "./data/models"
    MODEL_BATCH_SIZE: int = 32
    
    # Document Processing
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 100
    MIN_CHUNK_SIZE: int = 50
    MAX_CHUNKS_PER_DOC: int = 1000
    
    # Redis Cache
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_MAX_CONNECTIONS: int = 10
    CACHE_TTL: int = 3600  # 1 hour in seconds
    
    # Rate Limiting
    RATE_LIMIT_UPLOADS: int = 10  # uploads per minute
    RATE_LIMIT_SEARCHES: int = 60  # searches per minute
    RATE_LIMIT_WINDOW: int = 60  # window in seconds
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # File Storage
    UPLOAD_DIR: str = "./data/uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: List[str] = ["pdf"]
    STORAGE_PROVIDER: str = "local"  # or "s3", "supabase"
    
    # AWS S3 (optional)
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: Optional[str] = None
    S3_BUCKET_NAME: Optional[str] = None
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    LOG_FILE: Optional[str] = "./logs/app.log"
    
    # Background Tasks
    BACKGROUND_WORKERS: int = 2
    TASK_TIMEOUT: int = 300  # seconds
    MAX_RETRIES: int = 3
    RETRY_DELAY: int = 60  # seconds
    
    # Feature Flags
    ENABLE_AUTHENTICATION: bool = True
    ENABLE_CACHING: bool = True
    ENABLE_RATE_LIMITING: bool = True
    ENABLE_BACKGROUND_TASKS: bool = True

    @field_validator("UPLOAD_DIR")
    def create_upload_dir(cls, v):
        """Ensure upload directory exists"""
        os.makedirs(v, exist_ok=True)
        return v

    @field_validator("LOG_FILE")
    def create_log_dir(cls, v):
        """Ensure log directory exists"""
        if v:
            log_dir = os.path.dirname(v)
            os.makedirs(log_dir, exist_ok=True)
        return v

    def get_token_expire_time(self, token_type: str = "access") -> timedelta:
        """Get token expiration time based on type"""
        if token_type == "access":
            return timedelta(minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES)
        return timedelta(days=self.REFRESH_TOKEN_EXPIRE_DAYS)

    def get_db_pool_settings(self) -> Dict[str, Any]:
        """Get database pool settings"""
        return {
            "pool_size": self.DB_POOL_SIZE,
            "max_overflow": self.DB_MAX_OVERFLOW,
            "echo": self.DB_ECHO
        }

    class Config:
        env_file = ".env"
        case_sensitive = True

# Global settings instance
settings = Settings()