from pypdf import PdfReader
from .embedding import EmbeddingModel
from app.services.retreiver import VectorStore

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
