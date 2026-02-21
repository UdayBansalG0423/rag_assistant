from fastapi import FastAPI
from app.services.rag_service import RAGService

app = FastAPI()
rag_service = RAGService()

@app.get("/load")
def load():
    rag_service.index_pdf("data/sample.pdf")
    return {"status": "PDF indexed"}

@app.get("/ask")
def ask(q: str):
    answer = rag_service.generate(q)
    return {"answer": answer}
