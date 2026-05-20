from pydantic import BaseModel
from typing import Optional


class DocumentRecord(BaseModel):
    id: str
    user_id: str
    file_name: str
    storage_path: str
    status: str = "processing"  # processing, completed, failed
    progress: int = 0  # 0-100
    created_at: Optional[str] = None
    error: Optional[str] = None  # Error message if failed


class UploadDocumentResponse(DocumentRecord):
    message: str


class DocumentsListResponse(BaseModel):
    documents: list[DocumentRecord]