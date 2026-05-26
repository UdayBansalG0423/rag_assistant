import os

import redis
from app.core.logger import get_logger
import time

logger = get_logger(__name__)


redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", "6379")),
    db=int(os.getenv("REDIS_DB", "0")),
    decode_responses=True,
)

# Try a ping to surface connection failures early; keep client for retries if ping fails.
try:
    start = time.time()
    redis_client.ping()
    logger.info("redis_connected", extra={"latency_ms": int((time.time() - start) * 1000)})
except Exception as exc:
    logger.exception("redis_connection_failed", extra={"error": str(exc)})