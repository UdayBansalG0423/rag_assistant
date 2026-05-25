from functools import lru_cache
import os


@lru_cache(maxsize=1)
def load_sentence_transformer(model_name: str = "all-MiniLM-L6-v2"):
    from sentence_transformers import SentenceTransformer

    configured_model = os.getenv("EMBEDDING_MODEL_NAME", model_name)

    try:
        return SentenceTransformer(configured_model)
    except Exception as exc:
        raise RuntimeError(
            "Unable to load the local embedding model. "
            f"Tried '{configured_model}'. If the machine is offline, pre-download the model "
            "or set EMBEDDING_MODEL_NAME to a local SentenceTransformer path."
        ) from exc