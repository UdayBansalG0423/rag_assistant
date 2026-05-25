from app.services.documents.chunker import chunk_text
from app.services.documents.parser import extract_pdf_text
from app.services.documents.sanitizer import clean_chunks
from app.core.model_registry import get_embedding_model
from app.services.retrieval.retriever import VectorStore
from app.services.llm import generate_response
from app.core.logger import logger
import mlflow
import time


SIMILARITY_THRESHOLD = 5.0

vector_store = None


def load_pdf_and_index(path: str):
    global vector_store

    text = extract_pdf_text(path)
    chunks = clean_chunks(chunk_text(text, 500))
    embedding_model = get_embedding_model()
    embeddings = embedding_model.encode(chunks)

    vector_store = VectorStore(len(embeddings[0]))
    vector_store.add_embeddings(embeddings, chunks)


def retrieve(query: str):
    if vector_store is None:
        raise RuntimeError("Vector store is not initialized. Call /load first to index a document.")

    embedding_model = get_embedding_model()
    query_embedding = embedding_model.encode([query])[0]
    return vector_store.search(query_embedding)


def generate_rag_response(query: str):
    with mlflow.start_run():
        mlflow.log_param("model_name", "ollama3:8b")
        mlflow.log_param("embedding_model", "all-MiniLM-L6-v2")
        mlflow.log_param("system_version", "v1.1")
        mlflow.log_param("query", query)

        start_time = time.time()
        retrieved_results = retrieve(query)
        logger.info(f"Query: {query}")
        logger.info(f"Retrieved count: {len(retrieved_results)}")

        filtered = [r for r in retrieved_results if r["score"] <= SIMILARITY_THRESHOLD]

        if not filtered:
            logger.warning("No relevant context found.")
            mlflow.log_metric("retrieved_count", 0)
            mlflow.log_metric("latency", time.time() - start_time)
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
        logger.info(f"Response time: {latency:.2f}s")

        mlflow.log_metric("retrieved_count", len(filtered))
        mlflow.log_metric("latency", latency)

    return answer