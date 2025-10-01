"""
AI Summarization Module

This module provides text summarization capabilities using Hugging Face transformers.
Supports both single document and multi-document RAG-style summarization.
"""

import re
from typing import List, Dict, Optional
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class SummarizationGenerator:
    """
    Handles text summarization using extractive summarization.
    For now, uses extractive summarization to avoid ML model dependencies.
    """
    
    def __init__(self, model_name: str = "extractive"):
        """
        Initialize the summarization generator.
        
        Args:
            model_name: Model name (currently using extractive summarization)
        """
        self.model_name = model_name
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize the summarization model."""
        try:
            logger.info(f"Initializing {self.model_name} summarization")
            logger.info("Summarization model ready (extractive mode)")
            
        except Exception as e:
            logger.error(f"Failed to initialize summarization model: {e}")
            raise
    
    def summarize_text(self, text: str, max_length: int = 150, min_length: int = 30) -> str:
        """
        Summarize a single text using extractive summarization.
        
        Args:
            text: Input text to summarize
            max_length: Maximum length of summary
            min_length: Minimum length of summary
            
        Returns:
            Generated summary
        """
        try:
            if not text or len(text.strip()) < 50:
                return "Text too short for summarization."
            
            # Extract sentences
            sentences = self._extract_sentences(text)
            
            if len(sentences) <= 3:
                return text[:max_length] + "..." if len(text) > max_length else text
            
            # Select most important sentences (simple extractive approach)
            important_sentences = self._select_important_sentences(sentences, max_length)
            
            summary = " ".join(important_sentences)
            
            # Ensure minimum length
            if len(summary) < min_length and len(sentences) > 1:
                summary = " ".join(sentences[:2])
            
            return summary[:max_length] + "..." if len(summary) > max_length else summary
            
        except Exception as e:
            logger.error(f"Error in summarization: {e}")
            return f"Summarization failed: {str(e)}"
    
    def _extract_sentences(self, text: str) -> List[str]:
        """Extract sentences from text."""
        # Simple sentence splitting
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        return sentences
    
    def _select_important_sentences(self, sentences: List[str], max_length: int) -> List[str]:
        """Select the most important sentences for summarization."""
        if not sentences:
            return []
        
        # Simple heuristic: prefer longer sentences and those with keywords
        keywords = ['important', 'key', 'main', 'primary', 'significant', 'critical', 'essential']
        
        scored_sentences = []
        for sentence in sentences:
            score = len(sentence)  # Base score on length
            # Boost score for keywords
            for keyword in keywords:
                if keyword.lower() in sentence.lower():
                    score += 50
            scored_sentences.append((score, sentence))
        
        # Sort by score and select top sentences
        scored_sentences.sort(reverse=True)
        
        selected = []
        current_length = 0
        
        for score, sentence in scored_sentences:
            if current_length + len(sentence) <= max_length:
                selected.append(sentence)
                current_length += len(sentence)
            else:
                break
        
        return selected if selected else sentences[:2]
    
    def summarize_chunks(self, chunks: List[Dict], query: Optional[str] = None) -> str:
        """
        Summarize multiple document chunks with optional query context.
        
        Args:
            chunks: List of document chunks with text and metadata
            query: Optional query to provide context for summarization
            
        Returns:
            Generated summary
        """
        try:
            # Combine chunk texts
            combined_text = " ".join([chunk.get('text', '') for chunk in chunks])
            
            if not combined_text or len(combined_text.strip()) < 50:
                return "Insufficient content for summarization."
            
            # Add query context if provided
            if query:
                context = f"Query: {query}\n\nRelevant content: {combined_text}"
            else:
                context = combined_text
            
            return self.summarize_text(context)
            
        except Exception as e:
            logger.error(f"Error in chunk summarization: {e}")
            return f"Summarization failed: {str(e)}"
    
    def summarize_documents(self, documents: List[Dict], query: Optional[str] = None) -> str:
        """
        Summarize multiple documents with optional query context.
        
        Args:
            documents: List of documents with metadata
            query: Optional query to provide context for summarization
            
        Returns:
            Generated summary
        """
        try:
            # Extract text from documents
            document_texts = []
            for doc in documents:
                if 'content' in doc:
                    document_texts.append(doc['content'])
                elif 'text' in doc:
                    document_texts.append(doc['text'])
            
            if not document_texts:
                return "No document content available for summarization."
            
            # Combine all document texts
            combined_text = " ".join(document_texts)
            
            # Add query context if provided
            if query:
                context = f"Query: {query}\n\nRelevant documents: {combined_text}"
            else:
                context = combined_text
            
            return self.summarize_text(context)
            
        except Exception as e:
            logger.error(f"Error in document summarization: {e}")
            return f"Summarization failed: {str(e)}"
    
    def get_model_info(self) -> Dict:
        """Get information about the loaded model."""
        return {
            "model_name": self.model_name,
            "type": "extractive",
            "max_length": 150,
            "min_length": 30
        }

# Global instance
summarization_generator = SummarizationGenerator()
