import os
from pinecone import Pinecone
import uuid


class PineconeVectorStore:
    def __init__(self, dim: int):
        self.index_name = os.getenv("PINECONE_INDEX", "neuraldoc-index")
        self.pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        self.index = self.pc.Index(self.index_name)
        self.dim = dim

    def add_embeddings(self, embeddings, texts, doc_id, namespace: str = None):
        vectors = []

        for embedding, text in zip(embeddings, texts):
            if hasattr(embedding, "tolist"):
                embedding = embedding.tolist()
            vectors.append({
                "id": str(uuid.uuid4()),
                "values": embedding,
                "metadata": {
                    "chunk": text,
                    "doc_id": doc_id
                }
            })

        # Use namespace (Supabase user_id) when available to isolate tenants
        if namespace:
            self.index.upsert(vectors=vectors, namespace=namespace)
        else:
            self.index.upsert(vectors=vectors)

    def get_documents(self, namespace: str = None):
        """Return distinct doc_ids stored in Pinecone via list + fetch."""
        doc_ids = set()
        try:
            # If namespace provided, list only in that namespace
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

    def search(self, query_embedding, k=3, namespace: str = None):
        if hasattr(query_embedding, "tolist"):
            query_embedding = query_embedding.tolist()

        if namespace:
            results = self.index.query(
                vector=query_embedding,
                top_k=k,
                include_metadata=True,
                namespace=namespace,
            )
        else:
            results = self.index.query(
                vector=query_embedding,
                top_k=k,
                include_metadata=True,
            )

        formatted = []
        for match in results["matches"]:
            formatted.append({
                "chunk": match["metadata"]["chunk"],
                "doc_id": match["metadata"]["doc_id"],
                "score": match["score"]
            })

        return formatted