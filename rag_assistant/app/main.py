import os
from fastapi import FastAPI, UploadFile, File
from app.services.rag_service import RAGService
from app.schemas.response import AskResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings


app = FastAPI()
rag_service = RAGService()

UPLOAD_DIR = settings.UPLOAD_DIR
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get("/")
def serve_frontend():
    return FileResponse("app/static/index.html")


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        return {"error": "Only PDF files are allowed."}

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    rag_service.index_pdf(file_path)

    return {
        "status": "File uploaded and indexed successfully",
        "filename": file.filename
    }

@app.get("/ask", response_model=AskResponse)
def ask(q: str):
    if not q.strip():
        return {
            "answer": "Query cannot be empty.",
            "sources": [],
            "latency": 0.0
        }

    return rag_service.generate(q)

@app.get("/status")
def status():
    return {"documents_indexed": rag_service.has_documents()}

@app.get("/documents")
def list_docs():
    return {"documents": rag_service.get_documents()}