import os
import uuid

from pinecone import Pinecone


class PineconeVectorStore:
    def __init__(self, dim: int):
        self.index_name = os.getenv("PINECONE_INDEX", "neuraldoc-index")
        self.pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        self.index = self.pc.Index(self.index_name)
        self.dim = dim

    def add_embeddings(self, embeddings, texts, doc_id, user_id: str = None):
        vectors = []

        for chunk_index, (embedding, text) in enumerate(zip(embeddings, texts)):
            if hasattr(embedding, "tolist"):
                embedding = embedding.tolist()
            vectors.append({
                "id": str(uuid.uuid4()),
                "values": embedding,
                "metadata": {
                    "chunk": text,
                    "doc_id": doc_id,
                    "user_id": user_id,
                    "document_id": doc_id,
                    "chunk_index": chunk_index,
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
                "chunk": metadata.get("chunk", ""),
                "doc_id": metadata.get("doc_id") or metadata.get("document_id"),
                "score": match["score"],
            })

        return formatted