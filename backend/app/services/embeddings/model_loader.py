from functools import lru_cache


@lru_cache(maxsize=1)
def load_sentence_transformer(model_name: str = "all-MiniLM-L6-v2"):
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(model_name)