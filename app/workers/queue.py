import logging
from typing import Optional

from redis import Redis
from redis.exceptions import RedisError
from rq import Queue

from app.core.config import settings
from app.workers.tasks import process_document_task

logger = logging.getLogger(__name__)

QUEUE_NAME = "documents-processing"

class QueueUnavailableError(Exception):
    """Raised when the Redis-backed queue cannot be reached."""

_queue: Optional[Queue] = None


def _create_queue() -> Queue:
    redis_conn = Redis.from_url(settings.REDIS_URL)
    return Queue(
        QUEUE_NAME,
        connection=redis_conn,
        default_timeout=settings.TASK_TIMEOUT,
    )


def get_queue() -> Queue:
    global _queue
    if _queue is None:
        _queue = _create_queue()
    return _queue


def enqueue_document_processing(document_id: str) -> None:
    try:
        queue = get_queue()
        queue.enqueue(process_document_task, document_id, job_timeout=settings.TASK_TIMEOUT)
        logger.info("Queued document %s for processing", document_id)
    except RedisError as exc:  # noqa: BLE001
        logger.warning("Redis queue unavailable, falling back to background task: %s", exc)
        raise QueueUnavailableError("Redis queue unavailable") from exc
