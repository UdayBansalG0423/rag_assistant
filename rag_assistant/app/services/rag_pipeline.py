from pypdf import PdfReader
from .embedding import EmbeddingModel
from app.services.retreiver import VectorStore
from .llm import generate_response
from app.core.logger import logger
import time
import mlflow
import os

SIMILARITY_THRESHOLD = 5.0

def load_pdf_and_index(path: str):
    global vector_store
    vector_store.save()

    def __init__(self):
        self.embedding_model = EmbeddingModel()
        self.vector_store = VectorStore(384)

        # Try loading existing index
        if os.path.exists("vector_store/index.faiss"):
            self.vector_store.load()
            print("Vector store loaded successfully.")
        else:
            print("No existing vector store found.")

    def index_pdf(self, path: str):
        reader = PdfReader(path)
        text = ""

        for page in reader.pages:
            text += page.extract_text()

        chunks = [text[i:i+500] for i in range(0, len(text), 500)]
        embeddings = self.embedding_model.encode(chunks)

        self.vector_store.add_embeddings(embeddings, chunks)
        self.vector_store.save()

    def retrieve(self, query: str):
        query_embedding = self.embedding_model.encode([query])[0]
        return self.vector_store.search(query_embedding)

    def generate(self, query: str):

        mlflow.set_experiment("RAG-Observability")

        start_time = time.time()
        retrieved_results = self.retrieve(query)

        filtered = [
            r for r in retrieved_results
            if r["score"] <= SIMILARITY_THRESHOLD
        ]

        if not filtered:
            return "No relevant information found."

        context = "\n\n".join([r["chunk"] for r in filtered])

        prompt = f"""
You are an AI assistant.
Answer ONLY from the provided context.
If answer is not in context, say "Information not found in context."

Context:
{context}

Question:
{query}

Answer:
"""

        answer = generate_response(prompt)
        latency = time.time() - start_time

        logger.info(f"Query: {query}")
        logger.info(f"Retrieved count: {len(filtered)}")
        logger.info(f"Latency: {latency:.2f}s")

        return answer
