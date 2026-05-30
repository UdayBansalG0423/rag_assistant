import logging
import json
import time
import datetime
import contextvars
import os
from typing import Any, Dict

# Context variables for request/task-scoped metadata
ctx_request_id: contextvars.ContextVar[str | None] = contextvars.ContextVar("request_id", default=None)
ctx_user_id: contextvars.ContextVar[str | None] = contextvars.ContextVar("user_id", default=None)
ctx_session_id: contextvars.ContextVar[str | None] = contextvars.ContextVar("session_id", default=None)
ctx_task_id: contextvars.ContextVar[str | None] = contextvars.ContextVar("task_id", default=None)
ctx_start_time: contextvars.ContextVar[float | None] = contextvars.ContextVar("start_time", default=None)


def set_context(request_id: str | None = None, user_id: str | None = None, session_id: str | None = None, task_id: str | None = None) -> None:
    """Set context fields for the current execution context."""
    if request_id is not None:
        ctx_request_id.set(request_id)
    if user_id is not None:
        ctx_user_id.set(user_id)
    if session_id is not None:
        ctx_session_id.set(session_id)
    if task_id is not None:
        ctx_task_id.set(task_id)


def set_start_time(ts: float | None = None) -> None:
    """Set a start timestamp used to compute latency."""
    ctx_start_time.set(ts or time.time())


def clear_context() -> None:
    """Clear context values for the current context.

    (We set values to None rather than attempting to reset tokens.)
    """
    ctx_request_id.set(None)
    ctx_user_id.set(None)
    ctx_session_id.set(None)
    ctx_task_id.set(None)
    ctx_start_time.set(None)


class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        timestamp = datetime.datetime.utcnow().isoformat() + "Z"

        # Base payload
        payload: Dict[str, Any] = {
            "timestamp": timestamp,
            "level": record.levelname.lower(),
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Attach contextvars
        request_id = ctx_request_id.get()
        if request_id:
            payload["request_id"] = request_id
        user_id = ctx_user_id.get()
        if user_id:
            payload["user_id"] = user_id
        session_id = ctx_session_id.get()
        if session_id:
            payload["session_id"] = session_id
        task_id = ctx_task_id.get()
        if task_id:
            payload["task_id"] = task_id

        # Latency: prefer explicitly provided `latency_ms` in record extras, else compute from start_time
        if hasattr(record, "latency_ms") and record.__dict__.get("latency_ms") is not None:
            payload["latency_ms"] = record.__dict__.get("latency_ms")
        else:
            start = ctx_start_time.get()
            if start:
                try:
                    payload["latency_ms"] = int((time.time() - start) * 1000)
                except Exception:
                    pass

        # status if provided as extra
        if hasattr(record, "status") and record.__dict__.get("status") is not None:
            payload["status"] = record.__dict__.get("status")

        # Any extra fields passed via `extra=` should be included
        standard_attrs = set(vars(logging.LogRecord("", "", "", 0, "", (), None)))
        for k, v in record.__dict__.items():
            if k not in standard_attrs and k not in payload:
                try:
                    json.dumps({k: v})
                    payload[k] = v
                except Exception:
                    payload[k] = str(v)

        # Exception formatting
        if record.exc_info:
            payload["exc_info"] = self.formatException(record.exc_info)

        return json.dumps(payload, default=str, ensure_ascii=False)


# Configure root logger to use JSONFormatter
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
root = logging.getLogger()
if not root.handlers:
    root.addHandler(handler)

log_level_name = os.getenv("LOG_LEVEL")
if not log_level_name:
    log_level_name = "DEBUG" if os.getenv("ENVIRONMENT", "development").lower() == "development" else "INFO"

root.setLevel(getattr(logging, log_level_name.upper(), logging.INFO))


# Export a module-level logger for convenience
logger = logging.getLogger("neuraldoc")


def get_logger(name: str | None = None) -> logging.Logger:
    return logging.getLogger(name or "neuraldoc")


def get_request_id() -> str | None:
    """Return the current request_id from context, if any."""
    return ctx_request_id.get()
