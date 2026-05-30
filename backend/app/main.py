from app.core.config import settings
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
from app.core.model_registry import initialize_models
import logging
import uuid
import time
from fastapi import Request
from app.core.logger import set_context, set_start_time, clear_context, get_logger

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

logger = logging.getLogger(__name__)

app = FastAPI(title="NeuralDoc RAG API", debug=settings.DEBUG)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include auth routes (routes already prefixed with /auth/)
app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(chat_router)
app.include_router(health_router)

rag_service = RAGService()


@app.middleware("http")
async def add_request_context(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    set_context(request_id=request_id)
    start = time.time()
    set_start_time(start)

    try:
        response = await call_next(request)
        status = "success" if 200 <= response.status_code < 400 else "failure"
        # Log a concise request summary
        get_logger().info(
            "Request completed",
            extra={
                "endpoint": request.url.path,
                "status": status,
                "latency_ms": int((time.time() - start) * 1000),
            },
        )
        return response
    finally:
        clear_context()


@app.on_event("startup")
async def warm_embedding_model():
    try:
        initialize_models()
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
