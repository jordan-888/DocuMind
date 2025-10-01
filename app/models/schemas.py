from datetime import datetime
from typing import Dict, List, Optional, Any
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from enum import Enum

class DocumentStatus(str, Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    PROCESSED = "processed"
    FAILED = "failed"

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class User(UserBase):
    id: UUID
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class DocumentBase(BaseModel):
    title: str
    metadata: Dict[str, Any] = Field(default_factory=dict)

class Document(DocumentBase):
    id: UUID
    user_id: UUID
    storage_path: str
    status: DocumentStatus
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
    
    @classmethod
    def from_orm(cls, obj):
        """Convert from SQLAlchemy model to Pydantic model"""
        data = {
            "id": obj.id,
            "user_id": obj.user_id,
            "title": obj.title,
            "storage_path": obj.storage_path,
            "status": obj.status,
            "created_at": obj.created_at,
            "metadata": obj.meta_info or {}
        }
        return cls(**data)

class DocumentChunkBase(BaseModel):
    text: str
    metadata: Dict[str, Any] = Field(default_factory=dict)

class DocumentChunk(DocumentChunkBase):
    id: UUID
    document_id: UUID
    chunk_index: int
    embedding: List[float]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
    
    @classmethod
    def from_orm(cls, obj):
        """Convert from SQLAlchemy model to Pydantic model"""
        data = {
            "id": obj.id,
            "document_id": obj.document_id,
            "chunk_index": obj.chunk_index,
            "text": obj.text,
            "embedding": obj.embedding or [],
            "created_at": obj.created_at,
            "metadata": obj.meta_info or {}
        }
        return cls(**data)

class SearchQuery(BaseModel):
    query: str = Field(..., min_length=1, description="The search query text")
    top_k: int = Field(default=5, gt=0, le=20, description="Number of results to return")
    min_similarity: float = Field(
        default=0.5, 
        gt=0, 
        le=1.0, 
        description="Minimum similarity score (0-1) for results"
    )
    filters: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Optional metadata filters for the search"
    )

class SearchResult(BaseModel):
    chunk: DocumentChunk
    document: Document
    similarity_score: float
    model_config = ConfigDict(from_attributes=True)

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    total_results: int
    execution_time: float
    model_config = ConfigDict(from_attributes=True)

class ErrorDetail(BaseModel):
    message: str
    code: Optional[str] = None
    params: Optional[Dict[str, Any]] = None

class HTTPError(BaseModel):
    detail: ErrorDetail
    status_code: int

class SummarizeRequest(BaseModel):
    query: Optional[str] = None
    document_ids: Optional[List[UUID]] = None
    mode: str = Field(default="multi", description="single or multi document summarization")
    max_length: int = Field(default=150, ge=30, le=500)
    min_length: int = Field(default=30, ge=10, le=200)

class SummarizeResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    
    summary: str
    query: Optional[str] = None
    document_ids: Optional[List[UUID]] = None
    mode: str
    model_info: Dict[str, Any]
    processing_time: float