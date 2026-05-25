from pathlib import Path
from fastapi import FastAPI, Depends
from app.services.rag.orchestrator import RAGService
from app.schemas.response import AskResponse
from app.routes.documents import router as documents_router
from app.routes.chat import router as chat_router
from app.routes.health import router as health_router
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.services.auth_service import get_current_user_from_credentials
from app.routes.auth import router as auth_router
import logging

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

logger = logging.getLogger(__name__)

app = FastAPI(title="NeuralDoc RAG API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include auth routes (routes already prefixed with /auth/)
app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(chat_router)
app.include_router(health_router)

rag_service = RAGService()


@app.on_event("startup")
def warm_embedding_model():
    try:
        rag_service.embedding_provider._get_local_model()
        logger.info("Embedding model loaded successfully")
    except Exception as exc:
        logger.exception("Embedding model failed to load on startup: %s", exc)

if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
def serve_frontend():
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    return JSONResponse({"message": "NeuralDoc RAG API is running"})


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

    try:
        return rag_service.generate(q, user_id=current_user.id)
    except RuntimeError as exc:
        return JSONResponse(
            status_code=503,
            content={
                "answer": "Embedding model is not available right now.",
                "sources": [],
                "latency": 0.0,
                "detail": str(exc),
            },
        )
