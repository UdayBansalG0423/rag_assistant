from pathlib import Path
from fastapi import FastAPI, Depends
from app.services.rag_service import RAGService
from app.schemas.response import AskResponse
from app.routes.documents import router as documents_router
from app.routes.chat import router as chat_router
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.services.auth_service import get_current_user_from_credentials
from app.routes.auth import router as auth_router
import logging

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

logger = logging.getLogger(__name__)

app = FastAPI(title="NeuralDoc RAG API")

# Include auth routes (routes already prefixed with /auth/)
app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(chat_router)

rag_service = RAGService()

if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
def serve_frontend():
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/ask", response_model=AskResponse)
def ask(
    q: str, 
    current_user = Depends(get_current_user_from_credentials)
):
    """Query indexed documents (Supabase-authenticated)"""
    if not q.strip():
        return {
            "answer": "Query cannot be empty.",
            "sources": [],
            "latency": 0.0
        }

    return rag_service.generate(q, user_id=current_user.id)
