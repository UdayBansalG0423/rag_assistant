from fastapi import FastAPI, HTTPException
from app.services.rag_pipeline import  generate_rag_response , load_pdf_and_index


app = FastAPI()

@app.get("/load")
def load():
    load_pdf_and_index("data/sample.pdf")
    return {"status": "PDF indexed"}

@app.get("/ask")
def ask(q: str):
    try:
        answer = generate_rag_response(q)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    return {"answer": answer}

from app.services.rag_pipeline import retrieve

@app.get("/debug-retrieval")
def debug(q: str):
    results = retrieve(q)
    return {"results": results}

