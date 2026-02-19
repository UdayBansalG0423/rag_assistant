import faiss
import numpy as np

class VectorStore:
    def __init__(self, dim: int):
        self.index = faiss.IndexFlatL2(dim)
        self.text_chunks = []

    def add_embeddings(self, embeddings, texts):
        self.index.add(np.array(embeddings))
        self.text_chunks.extend(texts)

    def search(self, query_embedding, k=3):
        distances, indices = self.index.search(
            np.array([query_embedding]), k
        )

        results = []
        for idx, dist in zip(indices[0], distances[0]):
            results.append({
                "chunk": self.text_chunks[idx],
                "score": float(dist)
            })

        return results
