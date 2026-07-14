import logging
import os
import threading
from threading import Lock


logger = logging.getLogger(__name__)

_registry_lock = Lock()
_embedding_model = None
_embedding_model_error = None
_embedding_model_loading = False


def _resolve_embedding_model_name() -> str:
    configured = os.getenv("EMBEDDING_MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")
    return configured.strip() or "sentence-transformers/all-MiniLM-L6-v2"


def initialize_models(force: bool = False):
    global _embedding_model, _embedding_model_error, _embedding_model_loading

    with _registry_lock:
        if _embedding_model is not None and not force:
            return _embedding_model

        _embedding_model_loading = True

        model_name = _resolve_embedding_model_name()

        try:
            from sentence_transformers import SentenceTransformer

            _embedding_model = SentenceTransformer(model_name)
            _embedding_model_error = None
            logger.info("Embedding model initialized | model=%s", model_name)
            return _embedding_model
        except Exception as exc:
            _embedding_model = None
            _embedding_model_error = exc
            logger.exception("Failed to initialize embedding model | model=%s", model_name)
            raise RuntimeError(
                "Unable to initialize the embedding model during startup. "
                f"Tried '{model_name}'. Pre-download it locally or set EMBEDDING_MODEL_NAME "
                "to a cached SentenceTransformer path."
            ) from exc
        finally:
            _embedding_model_loading = False


def get_embedding_model():
    if _embedding_model is not None:
        return _embedding_model

    if _embedding_model_error is not None:
        raise RuntimeError(
            "Embedding model failed to initialize during startup. "
            "Check server logs for the original Hugging Face or filesystem error."
        ) from _embedding_model_error

    return initialize_models()


def start_embedding_model_warmup() -> None:
    if _embedding_model is not None or _embedding_model_loading:
        return

    def _warmup() -> None:
        try:
            initialize_models()
        except Exception:
            # The API stays up; first request can still trigger a lazy retry if needed.
            logger.exception("Background embedding warmup failed")

    thread = threading.Thread(target=_warmup, name="embedding-model-warmup", daemon=True)
    thread.start()


def is_embedding_model_ready() -> bool:
    return _embedding_model is not None


def is_embedding_model_loading() -> bool:
    return _embedding_model_loading


def get_embedding_model_error():
    return _embedding_model_error