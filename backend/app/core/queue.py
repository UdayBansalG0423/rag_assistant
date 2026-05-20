import json
from app.core.clients.redis_client import redis_client

QUEUE_NAME = "document_indexing_queue"

def enqueue_task(task_data: dict):
    """Add a task to the indexing queue."""
    redis_client.rpush(QUEUE_NAME, json.dumps(task_data))

def dequeue_task() -> dict:
    _, task= redis_client.blpop(QUEUE_NAME)
    return json.loads(task)