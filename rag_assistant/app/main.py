from fastapi import FastAPI, HTTPException
from app.services.rag_pipeline import  generate_rag_response , load_pdf_and_index


app = FastAPI()

@app.get("/load")
def load():
    load_pdf_and_index("data/sample.pdf")
    return {"status": "PDF indexed"}

@app.get("/ask")
def ask(q: str):
    answer = generate_rag_response(q)
    return {"answer": answer}
