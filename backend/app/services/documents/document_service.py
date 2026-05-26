from pathlib import Path
import os
import tempfile
import uuid

from fastapi import HTTPException, UploadFile
from supabase import create_client

from app.core.logger import logger
from app.core.supabase_client import supabase_admin
from app.utils.hash import generate_file_hash
from app.workers.indexing_tasks import process_document


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
        logger.info("Upload started | user_id=%s file_name=%s", user_id, filename)
        if not filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

        file_bytes = await file.read()

        file_hash = generate_file_hash(file_bytes)

        existing_doc = (
            supabase_admin.table("documents")
            .select("*")
            .eq("file_hash", file_hash)
            .eq("user_id", user_id)
            .execute()
        )

        if existing_doc.data:
            logger.info("Duplicate document detected | user_id=%s file_name=%s", user_id, filename)
            raise HTTPException(
                status_code=400,
                detail="Document already uploaded"
            )

        document_id = str(uuid.uuid4())
        storage_path = f"{user_id}/{document_id}.pdf"

        storage_client = create_client(self.supabase_url, self.service_key).storage
        storage_client.from_(self.bucket_name).upload(storage_path, file_bytes)

        record = {
            "id": document_id,
            "user_id": user_id,
            "file_name": file.filename,
            "storage_path": storage_path,
            "file_hash": file_hash,
            "status": "queued",
            "progress": 0,
        }

        supabase_admin.table("documents").insert(record).execute()

        temp_dir = Path(os.getenv("UPLOAD_DIR", "/app/tmp_uploads"))
        temp_dir.mkdir(parents=True, exist_ok=True)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf", dir=temp_dir) as temp_file:
            temp_file.write(file_bytes)
            temp_path = temp_file.name

        try:
            from app.core.logger import get_request_id

            process_document.delay(
                file_path=temp_path,
                user_id=str(user_id),
                document_id=str(document_id),
                request_id=get_request_id(),
            )
            logger.info(
                "Task queued successfully | document_id=%s user_id=%s status=queued",
                document_id,
                user_id,
            )
        except Exception as exc:
            supabase_admin.table("documents").update({
                "status": "failed",
                "progress": 0,
            }).eq("id", document_id).eq("user_id", user_id).execute()
            logger.exception(
                "Failed to enqueue indexing task | document_id=%s user_id=%s",
                document_id,
                user_id,
            )
            raise HTTPException(status_code=500, detail=f"Failed to enqueue indexing task: {exc}")

        logger.info("Upload completed | document_id=%s user_id=%s", document_id, user_id)
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
