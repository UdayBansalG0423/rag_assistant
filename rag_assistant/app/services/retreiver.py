import os
import numpy as np

class VectorStore:
    def __init__(self, dim: int):
        # Import faiss only when needed
        import faiss

        self.faiss = faiss
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
            if dist >= 1e30:
                continue

            results.append({
                "chunk": self.text_chunks[idx],
                "score": float(dist)
            })

        return results

    def save(self, path="vector_store"):
        os.makedirs(path, exist_ok=True)
        self.faiss.write_index(self.index, f"{path}/index.faiss")

        import pickle
        with open(f"{path}/chunks.pkl", "wb") as f:
            pickle.dump(self.text_chunks, f)

    def load(self, path="vector_store"):
        import pickle
        self.index = self.faiss.read_index(f"{path}/index.faiss")

        with open(f"{path}/chunks.pkl", "rb") as f:
            self.text_chunks = pickle.load(f)