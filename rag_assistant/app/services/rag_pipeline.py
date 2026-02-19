from pypdf import PdfReader
from .embedding import EmbeddingModel
from app.services.retreiver import VectorStore
from app.services.llm import generate_response
from app.core.logger import logger
import time
import mlflow

mlflow.set_experiment("RAG-Observability")


SIMILARITY_THRESHOLD = 1.5  # adjust after testing

embedding_model = EmbeddingModel()
vector_store = None

def load_pdf_and_index(path: str):
    global vector_store

    reader = PdfReader(path)
    text = ""
    for page in reader.pages:
        text += page.extract_text()

    chunks = [text[i:i+500] for i in range(0, len(text), 500)]

    embeddings = embedding_model.encode(chunks)

    vector_store = VectorStore(len(embeddings[0]))
    vector_store.add_embeddings(embeddings, chunks)

def retrieve(query: str):
    query_embedding = embedding_model.encode([query])[0]
    return vector_store.search(query_embedding)


def generate_rag_response(query: str):
    with mlflow.start_run():
        mlflow.log_param("model_name", "phi3:mini")
        mlflow.log_param("embedding_model", "all-MiniLM-L6-v2")
        mlflow.log_param("query", query)
        mlflow.log_metric("retrieved_count", len(filtered))
        mlflow.log_metric("latency", latency)

    retrieved_results = retrieve(query)
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
        return "No relevant information found."

 
    context = "\n\n".join([r["chunk"] for r in filtered])

    answer = generate_response(prompt)

    latency = time.time() - start_time
    logger.info(f"Response time: {latency:.2f}s")

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

    return answer
