from pydantic import BaseModel


class DocumentRecord(BaseModel):
    id: str
    user_id: str
    file_name: str
    storage_path: str
    created_at: str | None = None


class UploadDocumentResponse(DocumentRecord):
    message: str


class DocumentsListResponse(BaseModel):
    documents: list[DocumentRecord]