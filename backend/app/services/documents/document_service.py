from pathlib import Path
import os
import tempfile
import uuid

from fastapi import HTTPException, UploadFile
from supabase import create_client

from app.core.supabase_client import supabase_admin
from app.services.rag.orchestrator import RAGService


class DocumentService:
    def __init__(self):
        self.bucket_name = os.getenv("DOCUMENT_STORAGE_BUCKET", "documents")
        self.supabase_url = os.getenv("SUPABASE_URL", "").strip().rstrip("/")
        self.service_key = os.getenv("SUPABASE_SERVICE_KEY")

        if not self.supabase_url:
            raise EnvironmentError("Missing SUPABASE_URL in environment")

        if not self.service_key:
            raise EnvironmentError("Missing SUPABASE_SERVICE_KEY in environment")

    async def upload_document(self, file: UploadFile, user_id: str):
        filename = Path(file.filename or "document.pdf").name
        if not filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

        document_id = str(uuid.uuid4())
        storage_path = f"{user_id}/{document_id}.pdf"
        file_bytes = await file.read()

        storage_client = create_client(self.supabase_url, self.service_key).storage
        storage_client.from_(self.bucket_name).upload(storage_path, file_bytes)

        record = {
            "id": document_id,
            "user_id": user_id,
            "file_name": file.filename,
            "storage_path": storage_path,
            "status": "processing",
        }

        supabase_admin.table("documents").insert(record).execute()

        temp_path = None
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
                temp_file.write(file_bytes)
                temp_path = temp_file.name

            rag_service = RAGService()
            rag_service.index_pdf(temp_path, user_id=user_id, document_id=document_id)

            supabase_admin.table("documents").update({"status": "completed"}).eq("id", document_id).eq("user_id", user_id).execute()
            record["status"] = "completed"
        finally:
            if temp_path and os.path.exists(temp_path):
                os.remove(temp_path)

        return {**record, "message": "File uploaded successfully"}

    def list_documents(self, user_id: str):
        response = (
            supabase_admin.table("documents")
            .select("*")
            .eq("user_id", user_id)
            .execute()
        )

        return response.data or []

    def count_documents(self, user_id: str) -> int:
        return len(self.list_documents(user_id))
