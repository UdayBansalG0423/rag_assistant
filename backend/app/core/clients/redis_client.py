import os

import redis
from app.core.logger import get_logger
import time
from app.core.config import settings

logger = get_logger(__name__)

redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)

# Try a ping to surface connection failures early; keep client for retries if ping fails.
try:
    start = time.time()
    redis_client.ping()
    logger.info("redis_connected", extra={"latency_ms": int((time.time() - start) * 1000)})
except Exception as exc:
    logger.exception("redis_connection_failed", extra={"error": str(exc)})