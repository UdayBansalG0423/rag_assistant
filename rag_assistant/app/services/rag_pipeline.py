from pypdf import PdfReader
from .embedding import EmbeddingModel
from app.services.retreiver import VectorStore
from app.services.llm import generate_response
from app.core.logger import logger
import time
import mlflow
import re

mlflow.set_experiment("RAG-Observability")


SIMILARITY_THRESHOLD = 5.0  # adjust after testing

embedding_model = EmbeddingModel()
vector_store = None


def _clean_chunks(chunks):
    clean_chunks = []

    for chunk in chunks:
        if hasattr(chunk, "page_content"):
            chunk = chunk.page_content

        if not isinstance(chunk, str):
            continue

        chunk = re.sub(r'[\x00-\x1F\x7F-\x9F\uFFFE\uFFFF]', '', chunk)
        chunk = chunk.strip()

        if chunk:
            clean_chunks.append(chunk)

    return clean_chunks

def load_pdf_and_index(path: str):
    global vector_store
    vector_store.save()

    reader = PdfReader(path)
    text = ""
    for page in reader.pages:
        text += page.extract_text()

    chunks = [text[i:i+500] for i in range(0, len(text), 500)]
    clean_chunks = _clean_chunks(chunks)

    embeddings = embedding_model.encode(clean_chunks)

    vector_store = VectorStore(len(embeddings[0]))
    vector_store.add_embeddings(embeddings, clean_chunks)

def retrieve(query: str):
    if vector_store is None:
        raise RuntimeError("Vector store is not initialized. Call /load first to index a document.")
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

        filtered = [
            r for r in retrieved_results
            if r["score"] <= SIMILARITY_THRESHOLD
        ]

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
