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
from jose import jwt
from app.core.security import SECRET_KEY, ALGORITHM
from app.routes.auth import router as auth_router
from app.core.database import init_db

security = HTTPBearer()
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["sub"]
    except:
        raise HTTPException(status_code=401, detail="Invalid token")


app = FastAPI()

init_db()  # Create DB tables on startup
app.include_router(auth_router, prefix="/api")  # Register /api/register and /api/login

rag_service = RAGService()

UPLOAD_DIR = settings.UPLOAD_DIR
os.makedirs(UPLOAD_DIR, exist_ok=True)

if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
def serve_frontend():
    return FileResponse(STATIC_DIR / "index.html")


@app.post("/api/upload")
async def upload_pdf(file: UploadFile = File(...), current_user: str = Depends(get_current_user)):
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

@app.get("/api/ask", response_model=AskResponse)
def ask(q: str, current_user: str = Depends(get_current_user)):
    if not q.strip():
        return {
            "answer": "Query cannot be empty.",
            "sources": [],
            "latency": 0.0
        }

    return rag_service.generate(q)

@app.get("/api/status")
def status():
    return {"documents_indexed": rag_service.has_documents()}

@app.get("/api/documents")
def list_docs():
    return {"documents": rag_service.get_documents()}