from dataclasses import dataclass
from typing import Any

try:
    from langchain.text_splitter import RecursiveCharacterTextSplitter
except Exception:  # pragma: no cover - fallback for environments without langchain installed
    class RecursiveCharacterTextSplitter:
        def __init__(self, chunk_size=500, chunk_overlap=100, separators=None):
            self.chunk_size = chunk_size
            self.chunk_overlap = chunk_overlap
            self.separators = separators or ["\n\n", "\n", ". ", " ", ""]

        def split_text(self, text: str):
            if not text:
                return []

            chunks = []
            start = 0
            while start < len(text):
                end = min(len(text), start + self.chunk_size)
                chunks.append(text[start:end])
                if end >= len(text):
                    break
                start = max(end - self.chunk_overlap, start + 1)
            return chunks


@dataclass
class ChunkRecord:
    chunk: str
    metadata: dict[str, Any]


class DocumentChunker:
    def __init__(self):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=100,
            separators=[
                "\n\n",
                "\n",
                ". ",
                " ",
                "",
            ],
        )

    def chunk_text(self, text: str):
        return self.splitter.split_text(text)

    def chunk_pages(
        self,
        pages: list[dict],
        *,
        user_id: str | None = None,
        document_id: str | None = None,
        source: str | None = None,
    ) -> list[ChunkRecord]:
        records: list[ChunkRecord] = []

        for page in pages:
            page_number = page.get("page_number")
            page_text = page.get("text") or ""
            if not page_text.strip():
                continue

            chunks = self.chunk_text(page_text)
            for chunk_index, chunk in enumerate(chunks):
                cleaned = chunk.strip()
                if not cleaned:
                    continue

                records.append(
                    ChunkRecord(
                        chunk=cleaned,
                        metadata={
                            "user_id": user_id,
                            "document_id": document_id,
                            "chunk_index": len(records),
                            "page": page_number,
                            "source": source,
                        },
                    )
                )

        return records

def chunk_text(text: str, chunk_size: int = 500):
    if not text:
        return []

    return [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]