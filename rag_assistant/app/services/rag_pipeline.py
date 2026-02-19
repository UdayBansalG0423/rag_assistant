from pypdf import PdfReader
from .embedding import EmbeddingModel
from app.services.retreiver import VectorStore
from app.services.llm import generate_response

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
    retrieved_results = retrieve(query)

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

    return generate_response(prompt)
