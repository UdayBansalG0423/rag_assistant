import logging
import os
from threading import Lock


logger = logging.getLogger(__name__)

_registry_lock = Lock()
_embedding_model = None
_embedding_model_error = None


def _resolve_embedding_model_name() -> str:
    configured = os.getenv("EMBEDDING_MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")
    return configured.strip() or "sentence-transformers/all-MiniLM-L6-v2"


def initialize_models(force: bool = False):
    global _embedding_model, _embedding_model_error

    with _registry_lock:
        if _embedding_model is not None and not force:
            return _embedding_model

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


def get_embedding_model():
    if _embedding_model is not None:
        return _embedding_model

    if _embedding_model_error is not None:
        raise RuntimeError(
            "Embedding model failed to initialize during startup. "
            "Check server logs for the original Hugging Face or filesystem error."
        ) from _embedding_model_error

    raise RuntimeError(
        "Embedding model has not been initialized. Call initialize_models() during startup."
    )


def get_embedding_model_error():
    return _embedding_model_error