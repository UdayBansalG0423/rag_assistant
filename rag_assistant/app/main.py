import os
from pathlib import Path
from fastapi import FastAPI, UploadFile, File
from app.services.rag_service import RAGService
from app.schemas.response import AskResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends, HTTPException
from app.services.auth_service import get_current_user
from app.routes.auth import router as auth_router
import logging

security = HTTPBearer()
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

logger = logging.getLogger(__name__)

app = FastAPI(title="NeuralDoc RAG API")

# Include auth routes (routes already prefixed with /auth/)
app.include_router(auth_router)

rag_service = RAGService()

UPLOAD_DIR = settings.UPLOAD_DIR
os.makedirs(UPLOAD_DIR, exist_ok=True)

if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
def serve_frontend():
    return FileResponse(STATIC_DIR / "index.html")


@app.post("/api/upload")
async def upload_pdf(
    file: UploadFile = File(...), 
    current_user = Depends(get_current_user)
):
    """Upload and index a PDF file for the authenticated user"""
    if not file.filename.endswith(".pdf"):
        return {"error": "Only PDF files are allowed."}

    file_path = os.path.join(UPLOAD_DIR, f"{current_user.id}_{file.filename}")

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    try:
        rag_service.index_pdf(file_path, user_id=current_user.id)
    except Exception as e:
        logger.error(f"Error indexing PDF: {e}")
        return {"error": f"Failed to index PDF: {str(e)}"}

    return {
        "status": "File uploaded and indexed successfully",
        "filename": file.filename,
        "user_id": current_user.id
    }

@app.get("/api/ask", response_model=AskResponse)
def ask(
    q: str, 
    current_user = Depends(get_current_user)
):
    """Query indexed documents (Supabase-authenticated)"""
    if not q.strip():
        return {
            "answer": "Query cannot be empty.",
            "sources": [],
            "latency": 0.0
        }

    return rag_service.generate(q, user_id=current_user.id)

@app.get("/api/status")
def status():
    """Get status of vector store"""
    return {"documents_indexed": rag_service.has_documents()}

@app.get("/api/documents")
def list_docs(current_user = Depends(get_current_user)):
    """List all documents for current user"""
    return {"documents": rag_service.get_documents(user_id=current_user.id)}