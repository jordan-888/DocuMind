import fitz
from typing import List
import numpy as np
from sqlalchemy.orm.attributes import flag_modified

from app.ml.embeddings import EmbeddingGenerator
from app.models.database import Document, DocumentChunk
from app.core.config import settings
from app.services.storage import (
    download_supabase_file,
    is_supabase_path,
)

class DocumentProcessor:
    def __init__(self):
        self.embedding_generator = EmbeddingGenerator(settings.EMBEDDING_MODEL)

    def extract_text(self, pdf_path: str) -> tuple[List[str], dict]:
        """
        Extract text from PDF and split into chunks
        
        Returns:
            tuple: (chunks, metadata)
        """
        try:
            if is_supabase_path(pdf_path):
                pdf_bytes = download_supabase_file(pdf_path)
                if not pdf_bytes:
                    raise Exception("Unable to retrieve document from Supabase storage")
                doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            else:
                doc = fitz.open(pdf_path)
            chunks = []
            metadata = {
                "page_count": len(doc),
                "title": doc.metadata.get("title", ""),
                "author": doc.metadata.get("author", ""),
                "creation_date": doc.metadata.get("creationDate", ""),
                "modification_date": doc.metadata.get("modDate", "")
            }
            
            for page_num, page in enumerate(doc):
                text = page.get_text()
                # Split into semantic chunks (paragraphs)
                page_chunks = []
                current_chunk = []
                
                for line in text.split('\n'):
                    line = line.strip()
                    if not line:  # Empty line indicates paragraph break
                        if current_chunk:
                            chunk_text = ' '.join(current_chunk)
                            if len(chunk_text) >= 50:  # Minimum chunk size
                                page_chunks.append({
                                    "text": chunk_text,
                                    "page": page_num + 1
                                })
                            current_chunk = []
                    else:
                        current_chunk.append(line)
                
                # Don't forget the last chunk
                if current_chunk:
                    chunk_text = ' '.join(current_chunk)
                    if len(chunk_text) >= 50:
                        page_chunks.append({
                            "text": chunk_text,
                            "page": page_num + 1
                        })
                
                chunks.extend(page_chunks)
            
            return chunks, metadata
            
        except Exception as e:
            raise Exception(f"Error processing PDF: {str(e)}")
            
        finally:
            if 'doc' in locals():
                doc.close()

    def process_document(self, document: Document) -> List[DocumentChunk]:
        """Process a document: extract text, create chunks, generate embeddings"""
        try:
            # Extract text and metadata
            chunks, metadata = self.extract_text(document.storage_path)
            
            # Update document metadata
            if document.meta_info is None:
                document.meta_info = {}
            document.meta_info.update(metadata)
            flag_modified(document, "meta_info")
            document.status = "processing"
            
            chunk_texts = [chunk["text"] for chunk in chunks]
            embeddings = self.embedding_generator.generate_embeddings(chunk_texts)
            
            # Create document chunks with embeddings
            doc_chunks = []
            for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                doc_chunk = DocumentChunk(
                    document_id=document.id,
                    chunk_index=idx,
                    text=chunk["text"],
                    embedding=embedding.tolist(),
                    meta_info={"page": chunk["page"]}
                )
                doc_chunks.append(doc_chunk)
            
            # Update document status
            document.status = "processed"
            if document.meta_info is None:
                document.meta_info = {}
            document.meta_info["chunk_count"] = len(doc_chunks)
            flag_modified(document, "meta_info")
            
            return doc_chunks
            
        except Exception as e:
            document.status = "failed"
            if document.meta_info is None:
                document.meta_info = {}
            document.meta_info["error"] = str(e)
            flag_modified(document, "meta_info")
            raise