from fastapi import APIRouter, Depends, File, UploadFile

from app.schemas.document import DocumentsListResponse, UploadDocumentResponse
from app.services.auth.auth_service import get_current_user_from_credentials
from app.services.documents.document_service import DocumentService


router = APIRouter()
document_service = DocumentService()


@router.post("/upload", response_model=UploadDocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user_from_credentials),
):
    return await document_service.upload_document(file, current_user.id)


@router.get("/documents", response_model=DocumentsListResponse)
def list_documents(current_user=Depends(get_current_user_from_credentials)):
    return {"documents": document_service.list_documents(current_user.id)}
from fastapi import APIRouter, Depends, File, UploadFile
from app.schemas.document import DocumentsListResponse, UploadDocumentResponse
from app.services.auth_service import get_current_user_from_credentials
from app.services.document_service import DocumentService


router = APIRouter()
document_service = DocumentService()


@router.post("/upload", response_model=UploadDocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user_from_credentials),
):
    return await document_service.upload_document(file, current_user.id)


@router.get("/documents", response_model=DocumentsListResponse)
def list_documents(current_user=Depends(get_current_user_from_credentials)):
    return {"documents": document_service.list_documents(current_user.id)}