from fastapi import FastAPI, UploadFile, File
from app.services.rag_service import RAGService
import os

app = FastAPI()
rag_service = RAGService()

UPLOAD_DIR = "data"
os.makedirs(UPLOAD_DIR, exist_ok=True)


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

@app.get("/ask")
def ask(q: str):
    result = rag_service.generate(q)
    return result
