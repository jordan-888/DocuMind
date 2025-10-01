import logging
from typing import Optional

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.database import Document as DBDocument
from app.workers.processor import DocumentProcessor

logger = logging.getLogger(__name__)

def process_document_task(document_id: str) -> None:
    """Entry point used by background workers to process uploaded documents."""
    db: Optional[Session] = None
    try:
        db = SessionLocal()
        document: Optional[DBDocument] = (
            db.query(DBDocument).filter(DBDocument.id == document_id).first()
        )

        if not document:
            logger.warning("Document %s not found during processing", document_id)
            return

        processor = DocumentProcessor()
        chunks = processor.process_document(document)

        for chunk in chunks:
            db.add(chunk)

        db.commit()
        logger.info("Document %s processed with %d chunks", document_id, len(chunks))
    except Exception as exc:  # noqa: BLE001
        if db is not None:
            db.rollback()
        logger.exception("Failed processing document %s: %s", document_id, exc)
        raise
    finally:
        if db is not None:
            db.close()
