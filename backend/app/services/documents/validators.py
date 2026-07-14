from pathlib import Path

from fastapi import HTTPException, UploadFile


ALLOWED_EXTENSIONS = {".pdf"}
ALLOWED_MIME_TYPES = {"application/pdf"}
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB
READ_CHUNK_SIZE = 1024 * 1024  # 1 MB


def _validate_extension(filename: str) -> None:
    suffix = Path(filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")


def _validate_mime_type(content_type: str | None) -> None:
    if (content_type or "").lower() not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")


def _validate_not_empty(total_size: int) -> None:
    if total_size == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")


async def validate_and_read_pdf(file: UploadFile) -> bytes:
    filename = file.filename or "document.pdf"
    _validate_extension(filename)
    _validate_mime_type(file.content_type)

    total_size = 0
    chunks: list[bytes] = []

    while True:
        chunk = await file.read(READ_CHUNK_SIZE)
        if not chunk:
            break
        total_size += len(chunk)
        if total_size > MAX_FILE_SIZE_BYTES:
            raise HTTPException(status_code=400, detail="File too large. Maximum allowed size is 50 MB")
        chunks.append(chunk)

    _validate_not_empty(total_size)

    file_bytes = b"".join(chunks)

    # Quick signature check to reject mislabeled files.
    if not file_bytes.startswith(b"%PDF-"):
        raise HTTPException(status_code=400, detail="Invalid PDF file")

    return file_bytes