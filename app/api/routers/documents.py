import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Any

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, status
from sqlalchemy.orm import Session
import time

from app.core.config import settings
from app.models.schemas import (
    Document,
    DocumentChunk as DocumentChunkSchema,
    SearchQuery,
    SearchResponse,
    SearchResult,
    SummarizeRequest,
    SummarizeResponse,
)
from app.models.database import Document as DBDocument, DocumentChunk as DBDocumentChunk
from app.services.auth import auth_service
from app.core.database import get_db
from app.services.storage import save_document_bytes
from app.workers.queue import QueueUnavailableError, enqueue_document_processing
from app.workers.tasks import process_document_task
from gotrue import User as SupabaseUser
from app.ml.embeddings import EmbeddingGenerator
from app.ml.summarization import summarization_generator
import numpy as np
import fitz

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

@router.post("/upload", response_model=Document)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: SupabaseUser = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a new document and queue it for processing"""
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF files are supported")

    user_id = get_user_id(current_user)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not determine user ID")

    file_id = str(uuid.uuid4())
    pdf_metadata = {}
    file_content = await file.read()

    if not file_content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")

    if len(file_content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File is too large. Maximum size is {settings.MAX_UPLOAD_SIZE // (1024 * 1024)}MB"
        )

    try:
        try:
            with fitz.open(stream=file_content, filetype="pdf") as doc:
                if not doc.page_count:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or empty PDF file")
                pdf_metadata = {
                    "page_count": doc.page_count,
                    "title": doc.metadata.get("title", ""),
                    "author": doc.metadata.get("author", ""),
                }
        except Exception:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or corrupted PDF file")

        safe_filename = Path(file.filename).name or f"document-{file_id}.pdf"
        storage_key = f"{user_id}/{file_id}/{safe_filename}"
        storage_result = save_document_bytes(
            file_content,
            storage_key,
            content_type=file.content_type or "application/pdf",
        )

        db_document = DBDocument(
            id=file_id,
            user_id=user_id,
            title=safe_filename,
            storage_path=storage_result["path"],
            status="uploaded",
            meta_info={
                "original_name": file.filename,
                "size": len(file_content),
                "content_type": file.content_type,
                "upload_date": datetime.utcnow().isoformat(),
                "storage_provider": storage_result.get("provider"),
                "storage_public_url": storage_result.get("public_url"),
                **pdf_metadata,
            }
        )
        db.add(db_document)
        db.commit()
        db.refresh(db_document)

        try:
            enqueue_document_processing(str(db_document.id))
        except QueueUnavailableError:
            background_tasks.add_task(process_document_task, str(db_document.id))

        return Document.from_orm(db_document)

    except HTTPException as e:
        db.rollback()
        raise e
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred: {str(e)}")


@router.get("", response_model=List[Document])
async def list_documents(
    current_user: SupabaseUser = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """List documents for the current user"""
    user_id = get_user_id(current_user)
    documents = (
        db.query(DBDocument)
        .filter(DBDocument.user_id == user_id)
        .order_by(DBDocument.created_at.desc())
        .all()
    )
    return [Document.from_orm(doc) for doc in documents]

@router.get("/{document_id}", response_model=Document)
async def get_document(
    document_id: uuid.UUID,
    current_user: SupabaseUser = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Get document metadata"""
    user_id = get_user_id(current_user)
    document = db.query(DBDocument).filter(DBDocument.id == document_id).first()

    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    if str(document.user_id) != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return Document.from_orm(document)

@router.post("/search", response_model=SearchResponse)
async def search_documents(
    query: SearchQuery,
    current_user: SupabaseUser = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Search across documents using semantic similarity"""
    start_time = time.time()
    user_id = get_user_id(current_user)

    try:
        query_embedding = embedding_generator.generate_embeddings([query.query])[0]

        base_query = db.query(DBDocumentChunk, DBDocument)\
            .join(DBDocument)\
            .filter(DBDocument.user_id == user_id)

        if query.filters:
            for key, value in query.filters.items():
                base_query = base_query.filter(DBDocumentChunk.meta_info[key].astext == str(value))

        results = base_query.all()

        scored_results = []
        for chunk, document in results:
            if chunk.embedding is None:
                continue
            chunk_embedding = np.array(chunk.embedding)
            similarity = np.dot(query_embedding, chunk_embedding) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(chunk_embedding)
            )
            if similarity >= query.min_similarity:
                scored_results.append(SearchResult(
                    chunk=DocumentChunkSchema.from_orm(chunk),
                    document=Document.from_orm(document),
                    similarity_score=float(similarity)
                ))

        scored_results.sort(key=lambda x: x.similarity_score, reverse=True)
        top_results = scored_results[:query.top_k]

        execution_time = time.time() - start_time

        return SearchResponse(
            query=query.query,
            results=top_results,
            total_results=len(scored_results),
            execution_time=execution_time
        )

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Search operation failed: {str(e)}")

@router.post(
    "/summarize",
    response_model=SummarizeResponse,
    summary="Generate AI Summary",
    description="Generate an AI-powered summary of documents using RAG (Retrieval-Augmented Generation)",
    tags=["documents"]
)
async def summarize_documents(
    request: SummarizeRequest,
    current_user: SupabaseUser = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate an AI-powered summary of documents.
    
    This endpoint supports two modes:
    - Query-based: Uses semantic search to find relevant chunks, then summarizes them
    - Document-based: Summarizes specific documents by ID
    
    Args:
        request: Summarization request with query, document IDs, and parameters
        current_user: Authenticated user
        db: Database session
        
    Returns:
        SummarizeResponse: Generated summary with metadata
    """
    start_time = time.time()
    
    try:
        # If query is provided, use semantic search to find relevant chunks
        if request.query:
            query_embedding = embedding_generator.generate_embeddings([request.query])[0]

            chunks = db.query(DBDocumentChunk).join(DBDocument).filter(
                DBDocument.user_id == get_user_id(current_user)
            ).all()

            if not chunks:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No document chunks found for summarization"
                )

            scored_chunks = []
            for chunk in chunks:
                if not chunk.embedding:
                    continue
                chunk_embedding = np.array(chunk.embedding)
                similarity = np.dot(query_embedding, chunk_embedding) / (
                    np.linalg.norm(query_embedding) * np.linalg.norm(chunk_embedding)
                )
                scored_chunks.append((similarity, chunk))

            if not scored_chunks:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No document chunks with embeddings available for summarization"
                )

            scored_chunks.sort(key=lambda item: item[0], reverse=True)
            relevant_chunks = [chunk for _, chunk in scored_chunks[:10]]

            chunk_data = [
                {
                    "text": chunk.text,
                    "metadata": chunk.meta_info or {},
                    "similarity_score": float(score)
                }
                for score, chunk in scored_chunks[:10]
            ]

            # Generate summary using RAG
            summary = summarization_generator.summarize_chunks(
                chunk_data, 
                request.query
            )

            document_ids = list(set([chunk.document_id for chunk in relevant_chunks]))

        # If specific document IDs are provided
        elif request.document_ids:
            # Get documents
            documents = db.query(DBDocument).filter(
                DBDocument.id.in_(request.document_ids),
                DBDocument.user_id == get_user_id(current_user)
            ).all()
            
            if not documents:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No documents found with the provided IDs"
                )
            
            # Get chunks for these documents
            chunks = db.query(DBDocumentChunk).filter(
                DBDocumentChunk.document_id.in_(request.document_ids)
            ).all()

            if not chunks:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No document chunks found for summarization"
                )
            
            # Convert to dict format
            chunk_data = [
                {
                    "text": chunk.text,
                    "metadata": chunk.meta_info or {}
                }
                for chunk in chunks
            ]
            
            # Generate summary
            summary = summarization_generator.summarize_chunks(chunk_data)
            document_ids = request.document_ids
            
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either query or document_ids must be provided"
            )
        
        processing_time = time.time() - start_time
        
        return SummarizeResponse(
            summary=summary,
            query=request.query,
            document_ids=document_ids,
            mode=request.mode,
            model_info=summarization_generator.get_model_info(),
            processing_time=processing_time
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Summarization failed: {str(e)}"
        )

