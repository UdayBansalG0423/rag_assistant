from fastapi import FastAPI, HTTPException
from app.services.rag_pipeline import retrieve
from app.services.rag_pipeline import  generate_rag_response , load_pdf_and_index
from app.services.rag_pipeline import vector_store


app = FastAPI()

@app.get("/load")
def load():
    load_pdf_and_index("data/sample.pdf")
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



