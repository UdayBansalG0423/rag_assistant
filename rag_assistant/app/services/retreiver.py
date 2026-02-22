import faiss
import os
import numpy as np

class VectorStore:
    def __init__(self, dim: int):
        self.index = faiss.IndexFlatL2(dim)
        self.documents = []  # list of {"chunk": ..., "doc_id": ...}

    def add_embeddings(self, embeddings, texts, doc_id):
        self.index.add(np.array(embeddings))
        for text in texts:
            self.documents.append({
                "chunk": text,
                "doc_id": doc_id  # temporary, will assign in service
    })

    def search(self, query_embedding, k=3):
        distances, indices = self.index.search(
            np.array([query_embedding]), k
        )

        results = []
        for idx, dist in zip(indices[0], distances[0]):

            # Skip FAISS invalid placeholder values
            if dist >= 1e30:
                continue

            results.append({
                "chunk": self.documents[idx]["chunk"],
                "doc_id": self.documents[idx]["doc_id"],
                "score": float(dist)
            })

        return results
    def save(self, path="vector_store"):
        os.makedirs(path, exist_ok=True)
        faiss.write_index(self.index, f"{path}/index.faiss")

        with open(f"{path}/chunks.pkl", "wb") as f:
            import pickle
            pickle.dump(self.documents, f)

    def load(self, path="vector_store"):
        import pickle
        self.index = faiss.read_index(f"{path}/index.faiss")

        with open(f"{path}/chunks.pkl", "rb") as f:
            self.documents = pickle.load(f)


