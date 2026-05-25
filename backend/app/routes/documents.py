from fastapi import APIRouter, Depends, File, UploadFile

from app.schemas.document import DocumentsListResponse, UploadDocumentResponse
from app.services.auth.auth_service import get_current_user_from_credentials
from app.services.documents.document_service import DocumentService
import os
import json

router = APIRouter()
document_service = DocumentService()


@router.get("/upload/status/{document_id}")
def upload_status(document_id: str, current_user=Depends(get_current_user_from_credentials)):
    base_progress_dir = os.getenv("RAG_PROGRESS_DIR", "vector_store_progress")
    user_dir = current_user.id if current_user and hasattr(current_user, "id") else "public"
    progress_path = os.path.join(base_progress_dir, user_dir, f"{document_id}.json")

    if not os.path.exists(progress_path):
        return {"status": "not_found"}

    try:
        with open(progress_path, "r", encoding="utf-8") as pf:
            return json.load(pf)
    except Exception as exc:
        return {"status": "error", "error": str(exc)}


@router.get("/upload/status_public/{document_id}")
def upload_status_public(document_id: str, user: str = "testuser"):
    """Unauthenticated progress read (for smoke tests)."""
    base_progress_dir = os.getenv("RAG_PROGRESS_DIR", "vector_store_progress")
    progress_path = os.path.join(base_progress_dir, user, f"{document_id}.json")

    if not os.path.exists(progress_path):
        return {"status": "not_found"}

    try:
        with open(progress_path, "r", encoding="utf-8") as pf:
            return json.load(pf)
    except Exception as exc:
        return {"status": "error", "error": str(exc)}


@router.post("/upload", response_model=UploadDocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user_from_credentials),
):
    return await document_service.upload_document(file, current_user.id)


@router.get("/documents", response_model=DocumentsListResponse)
def list_documents(current_user=Depends(get_current_user_from_credentials)):
    return {"documents": document_service.list_documents(current_user.id)}
