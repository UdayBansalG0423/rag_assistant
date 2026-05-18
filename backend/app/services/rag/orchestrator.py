from dotenv import load_dotenv

from app.core.logger import logger
from app.services.documents.chunker import chunk_text
from app.services.documents.parser import extract_pdf_text
from app.services.documents.sanitizer import clean_chunks
from app.services.embeddings.provider import EmbeddingProvider
from app.services.retrieval.retriever import VectorStore
import mlflow
import os
import time

from app.services.llm import generate_response

load_dotenv()

SIMILARITY_THRESHOLD = 5.0


class RAGService:
    def __init__(self):
        self.embedding_provider = EmbeddingProvider()
        self.vector_provider = os.getenv("VECTOR_DB_PROVIDER", "faiss")

        if self.vector_provider == "pinecone":
            try:
                from app.services.retrieval.pinecone_store import PineconeVectorStore

                self.vector_store = PineconeVectorStore(384)
                print("Using Pinecone vector store.")
            except Exception as exc:
                logger.warning(f"Falling back to FAISS vector store: {exc}")
                self.vector_provider = "faiss"
                self.vector_store = VectorStore(384)
        else:
            self.vector_store = VectorStore(384)

        if self.vector_provider != "pinecone":
            if os.path.exists("vector_store/index.faiss"):
                self.vector_store.load()
                print("Vector store loaded successfully.")
            else:
                print("No existing vector store found.")

    def index_pdf(self, path: str, user_id: str = None, document_id: str = None):
        text = extract_pdf_text(path)
        chunks = chunk_text(text, 500)
        clean = clean_chunks(chunks)

        if not clean:
            logger.warning(f"No clean chunks extracted from {path}")
            return

        embeddings = self.embedding_provider.embed(clean)
        doc_id = document_id or os.path.basename(path)

        if self.vector_provider == "pinecone":
            self.vector_store.add_embeddings(embeddings, clean, doc_id, user_id=user_id)
        else:
            self.vector_store.add_embeddings(embeddings, clean, user_id=user_id)
            self.vector_store.save(f"vector_store/{user_id}" if user_id else "vector_store")

    def retrieve(self, query: str, user_id: str = None):
        query_embedding = self.embedding_provider.embed([query])[0]
        logger.info(f"Retrieval query generated for user_id={user_id}")

        if self.vector_provider == "pinecone":
            results = self.vector_store.search(query_embedding, user_id=user_id)
        else:
            results = self.vector_store.search(query_embedding, user_id=user_id)

        logger.info(f"Retrieved matches: {len(results)}")
        return results

    def generate(self, query: str, user_id: str = None):
        mlflow.set_experiment("RAG-Observability")

        start_time = time.time()
        retrieved_results = self.retrieve(query, user_id=user_id)

        filtered = [r for r in retrieved_results if r["score"] <= SIMILARITY_THRESHOLD]
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
        if self.vector_provider == "pinecone":
            return self.vector_store.get_documents()

        docs = set()
        base = "vector_store"
        if os.path.exists(base):
            for root, _, files in os.walk(base):
                if "chunks.pkl" in files:
                    try:
                        import pickle

                        with open(os.path.join(root, "chunks.pkl"), "rb") as f:
                            pickle.load(f)
                        docs.add(os.path.basename(root))
                    except Exception:
                        pass

        return list(docs)