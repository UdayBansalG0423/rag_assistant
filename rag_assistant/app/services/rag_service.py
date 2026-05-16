from pypdf import PdfReader
from app.services.embedding_provider import EmbeddingProvider
from app.services.retreiver import VectorStore
from app.services.pinecone_store import PineconeVectorStore
from .llm import generate_response
from app.core.logger import logger
import time
import mlflow
import os
from dotenv import load_dotenv      
load_dotenv()

SIMILARITY_THRESHOLD = 5.0

class RAGService:

    def __init__(self):
        self.embedding_provider = EmbeddingProvider()
        self.vector_provider = os.getenv("VECTOR_DB_PROVIDER")

        if self.vector_provider == "pinecone":
            self.vector_store = PineconeVectorStore(384)
            print("Using Pinecone vector store.")
        else:
            self.vector_store = VectorStore(384)
            # Try loading existing index
            if os.path.exists("vector_store/index.faiss"):
                self.vector_store.load()
                print("Vector store loaded successfully.")
            else:
                print("No existing vector store found.")

    def index_pdf(self, path: str, user_id: str = None):
        reader = PdfReader(path)
        text = ""

        for page in reader.pages:
            text += page.extract_text()

        chunks = [text[i:i+500] for i in range(0, len(text), 500)]
        embeddings = self.embedding_provider.embed(chunks)

        doc_id = os.path.basename(path)
        # default: no user namespace
        if self.vector_provider == "pinecone":
            self.vector_store.add_embeddings(embeddings, chunks, doc_id, namespace=user_id)
        else:
            self.vector_store.add_embeddings(embeddings, chunks, user_id=user_id)
            self.vector_store.save(f"vector_store/{user_id}" if user_id else "vector_store")
        

    def retrieve(self, query: str, user_id: str = None):
        query_embedding = self.embedding_provider.embed([query])[0]
        if self.vector_provider == "pinecone":
            return self.vector_store.search(query_embedding, namespace=user_id)
        else:
            return self.vector_store.search(query_embedding, user_id=user_id)

    def generate(self, query: str, user_id: str = None):

        mlflow.set_experiment("RAG-Observability")

        start_time = time.time()
        retrieved_results = self.retrieve(query, user_id=user_id)

        filtered = [
            r for r in retrieved_results
            if r["score"] <= SIMILARITY_THRESHOLD
        ]

        sources = list(set([r["doc_id"] for r in filtered]))

        if not filtered:
            latency = round(time.time() - start_time, 2)
            logger.info(f"Query: {query}")
            logger.info("Retrieved count: 0")
            logger.info(f"Latency: {latency:.2f}s")
            return {
                "answer": "No relevant information found.",
                "sources": [],
                "latency": latency,
            }

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
        latency = round(time.time() - start_time, 2)

        logger.info(f"Query: {query}")
        logger.info(f"Retrieved count: {len(filtered)}")
        logger.info(f"Latency: {latency:.2f}s")

        return {
            "answer": answer,
            "sources": sources,
            "latency": latency
        }
    def has_documents(self):
        return len(self.get_documents()) > 0

    def get_documents(self):
        # Note: for tenant isolation, prefer calling get_documents(user_id)
        if self.vector_provider == "pinecone":
            return self.vector_store.get_documents()
        # For FAISS path, attempt to list any saved doc ids across stored chunks
        # This is a simple fallback; per-user listing is handled by passing user_id to load/search
        docs = set()
        # try to introspect saved vector_store folder
        base = "vector_store"
        if os.path.exists(base):
            for root, _, files in os.walk(base):
                if "chunks.pkl" in files:
                    try:
                        import pickle
                        with open(os.path.join(root, "chunks.pkl"), "rb") as f:
                            chunks = pickle.load(f)
                        # we don't have doc_id metadata here; skip
                        docs.add(os.path.basename(root))
                    except Exception:
                        pass
        return list(docs)