import os
import uuid
import re

from pinecone import Pinecone


import unicodedata


def _safe_text(value: object, max_len: int = 2000) -> str:
    """Coerce to str, remove control characters and surrogate codepoints,
    normalize, and truncate to `max_len`.
    """
    if value is None:
        return ""

    if not isinstance(value, str):
        value = str(value)

    # Normalize to NFC
    try:
        value = unicodedata.normalize("NFC", value)
    except Exception:
        pass

    # Filter out control chars and surrogate codepoints
    cleaned_chars = []
    for ch in value:
        cp = ord(ch)
        # drop C0/C1 controls, non-characters, and UTF-16 surrogate halves
        if cp <= 0x1F or (0x7F <= cp <= 0x9F) or cp in (0xFFFE, 0xFFFF) or (0xD800 <= cp <= 0xDFFF):
            continue
        cleaned_chars.append(ch)

    cleaned = "".join(cleaned_chars)

    if len(cleaned) > max_len:
        return cleaned[:max_len]
    return cleaned


class PineconeVectorStore:
    def __init__(self, dim: int):
        self.index_name = os.getenv("PINECONE_INDEX", "neuraldoc-index")
        self.pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        self.index = self.pc.Index(self.index_name)
        self.dim = dim

    def add_embeddings(self, embeddings, texts, doc_id, user_id: str = None):
        vectors = []

        for chunk_index, (embedding, text) in enumerate(zip(embeddings, texts)):
            chunk_text = text.get("chunk") if isinstance(text, dict) else text
            chunk_metadata = text.get("metadata", {}) if isinstance(text, dict) else {}
            if hasattr(embedding, "tolist"):
                embedding = embedding.tolist()
            vectors.append({
                "id": str(uuid.uuid4()),
                "values": embedding,
                "metadata": {
                    "chunk": _safe_text(chunk_text),
                    "doc_id": _safe_text(doc_id),
                    "user_id": _safe_text(user_id),
                    "document_id": _safe_text(doc_id),
                    "chunk_index": chunk_index,
                    "page": chunk_metadata.get("page"),
                    "source": _safe_text(chunk_metadata.get("source")),
                }
            })

        if user_id:
            self.index.upsert(vectors=vectors, namespace=user_id)
        else:
            self.index.upsert(vectors=vectors)

    def get_documents(self, namespace: str = None):
        doc_ids = set()
        try:
            if namespace:
                for id_batch in self.index.list(namespace=namespace):
                    fetch_result = self.index.fetch(ids=id_batch, namespace=namespace)
                    for vec in fetch_result.vectors.values():
                        if vec.metadata and "doc_id" in vec.metadata:
                            doc_ids.add(vec.metadata["doc_id"])
            else:
                for id_batch in self.index.list():
                    fetch_result = self.index.fetch(ids=id_batch)
                    for vec in fetch_result.vectors.values():
                        if vec.metadata and "doc_id" in vec.metadata:
                            doc_ids.add(vec.metadata["doc_id"])
        except Exception:
            pass
        return list(doc_ids)

    def search(self, query_embedding, k=3, user_id: str = None):
        if hasattr(query_embedding, "tolist"):
            query_embedding = query_embedding.tolist()

        query_kwargs = {
            "vector": query_embedding,
            "top_k": k,
            "include_metadata": True,
        }

        if user_id:
            query_kwargs["namespace"] = user_id
            query_kwargs["filter"] = {"user_id": user_id}

        results = self.index.query(**query_kwargs)

        formatted = []
        for match in results["matches"]:
            metadata = match.get("metadata") or {}
            formatted.append({
                "chunk": _safe_text(metadata.get("chunk", "")),
                "doc_id": _safe_text(metadata.get("doc_id") or metadata.get("document_id")),
                "metadata": metadata,
                "score": match["score"],
            })

        return formatted