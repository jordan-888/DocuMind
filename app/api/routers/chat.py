import time
import numpy as np
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.auth import auth_service
from app.models.chat import ChatRequest, ChatResponse, ChatCitation
from app.models.database import Document as DBDocument, DocumentChunk as DBDocumentChunk
from app.ml.embeddings import EmbeddingGenerator

router = APIRouter()
embedding_generator = EmbeddingGenerator()

def get_user_id(user: Any) -> str:
    """Safely get user ID from either a Supabase object or a test dictionary."""
    if isinstance(user, dict):
        return user.get("id")
    
    # Handle UserResponse object from newer Supabase client
    if hasattr(user, "user") and user.user:
        return str(user.user.id)
        
    return str(user.id)

@router.post("", response_model=ChatResponse)
async def chat_with_documents(
    request: ChatRequest,
    current_user: Any = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Chat with your documents. 
    Currently implements a Retrieval-Augmented Generation (RAG) flow.
    """
    start_time = time.time()
    user_id = get_user_id(current_user)
    
    try:
        # 1. Generate embedding for the query
        query_embedding = embedding_generator.generate_embeddings([request.query])[0]
        
        # 2. Build base query
        base_query = db.query(DBDocumentChunk, DBDocument)\
            .join(DBDocument)\
            .filter(DBDocument.user_id == user_id)
            
        # 3. Filter by specific documents if requested
        if request.document_ids:
            base_query = base_query.filter(DBDocument.id.in_(request.document_ids))
            
        # 4. Get all candidate chunks (for re-ranking/filtering)
        # Note: In a production app with millions of chunks, you'd use the vector index directly 
        # via SQL/pgvector operators. For this scale, fetching and computing similarity in-memory 
        # or using a simpler filter is acceptable, but ideally we use the vector operator.
        # Since we are using python-based similarity in other parts, we'll stick to that for consistency
        # but limit the fetch to avoid OOM.
        
        # Optimization: Fetch only necessary fields
        chunks = base_query.all()
        
        if not chunks:
            return ChatResponse(
                answer="I couldn't find any documents to answer your question. Please upload some documents first.",
                citations=[],
                processing_time=time.time() - start_time
            )
            
        # 5. Calculate similarity
        scored_results = []
        for chunk, document in chunks:
            if chunk.embedding is None:
                continue
                
            chunk_embedding = np.array(chunk.embedding)
            similarity = np.dot(query_embedding, chunk_embedding) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(chunk_embedding)
            )
            
            if similarity >= 0.4:  # Threshold for relevance
                scored_results.append((similarity, chunk, document))
                
        # 6. Sort and select top results
        scored_results.sort(key=lambda x: x[0], reverse=True)
        top_results = scored_results[:5]
        
        if not top_results:
             return ChatResponse(
                answer="I searched your documents but couldn't find any relevant information to answer your question.",
                citations=[],
                processing_time=time.time() - start_time
            )
            
        # 7. Construct Answer (Retrieval-based)
        # In a full implementation, this text would be fed to an LLM (OpenAI/Anthropic)
        # to generate a natural language response.
        # For now, we present the most relevant excerpts.
        
        intro = "Based on your documents, here is the relevant information:\n\n"
        excerpts = []
        citations = []
        
        for score, chunk, doc in top_results:
            excerpts.append(f"- {chunk.text.strip()}")
            
            citations.append(ChatCitation(
                document_id=doc.id,
                chunk_id=chunk.id,
                text=chunk.text[:200] + "...",
                page_number=chunk.meta_info.get("page_number"),
                similarity_score=float(score)
            ))
            
        answer = intro + "\n\n".join(excerpts)
        
        return ChatResponse(
            answer=answer,
            citations=citations,
            processing_time=time.time() - start_time
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat error: {str(e)}"
        )
