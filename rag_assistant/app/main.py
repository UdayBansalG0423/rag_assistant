from fastapi import FastAPI
from app.services.llm import generate_response

app = FastAPI()

@app.get("/")
def root():
    response = generate_response("Explain RAG in simple terms.")
    return {"response": response}