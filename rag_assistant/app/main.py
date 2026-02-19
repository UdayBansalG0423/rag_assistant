from fastapi import FastAPI, HTTPException
from app.services.rag_pipeline import load_pdf_and_index, retrieve

app = FastAPI()

@app.get("/load")
def load():
    load_pdf_and_index("data/sample.pdf")
    return {"status": "PDF indexed"}

@app.get("/ask")
def ask(q: str):
    try:
        chunks = retrieve(q)
        return {"retrieved_chunks": chunks}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
