from typing import List, Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of the message sender (user/assistant)")
    content: str = Field(..., description="Content of the message")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, description="User's question")
    history: List[ChatMessage] = Field(default_factory=list, description="Conversation history")
    document_ids: Optional[List[UUID]] = Field(default=None, description="Specific documents to chat about")
    
class ChatCitation(BaseModel):
    document_id: UUID
    chunk_id: UUID
    text: str
    page_number: Optional[int] = None
    similarity_score: float

class ChatResponse(BaseModel):
    answer: str
    citations: List[ChatCitation] = Field(default_factory=list)
    processing_time: float
    model_config = ConfigDict(from_attributes=True)
