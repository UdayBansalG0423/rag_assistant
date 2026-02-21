from fastapi import FastAPI
from app.services.rag_pipeline import RAGService

app = FastAPI()
rag_service = RAGService()

@app.get("/load")
def load():
    rag_service.index_pdf("data/sample.pdf")
    return {"status": "PDF indexed"}

@app.get("/ask")
def ask(q: str):
    results = retrieve(q)
    return {"results": results}

@app.on_event("startup")
def startup_event():
    try:
        vector_store.load()
        print("Vector store loaded successfully.")
    except:
        print("No existing vector store found.")



