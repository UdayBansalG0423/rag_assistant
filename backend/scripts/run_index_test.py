import os
import json
import time

import app.services.documents.parser as parser_mod


class DummyModel:
    def encode(self, texts):
        # return fixed 384-d vectors
        return [[0.01] * 384 for _ in texts]


def main():
    os.environ["RAG_PROGRESS_DIR"] = "vector_store_progress"
    # force FAISS for local testing and monkeypatch PDF extraction
    os.environ["VECTOR_DB_PROVIDER"] = "faiss"
    parser_mod.extract_pdf_text = lambda path: ("This is a test document. " * 200)

    from app.services.rag.orchestrator import RAGService

    svc = RAGService()
    svc.embedding_provider.provider = "local"
    svc.embedding_provider.model = DummyModel()

    print("Starting indexing test...")
    svc.index_pdf("/tmp/fake.pdf", user_id="testuser", document_id="testdoc")

    progress_path = os.path.join("vector_store_progress", "testuser", "testdoc.json")
    if os.path.exists(progress_path):
        with open(progress_path, "r", encoding="utf-8") as f:
            print("Progress file:")
            print(json.dumps(json.load(f), indent=2))
    else:
        print("No progress file found at", progress_path)


if __name__ == "__main__":
    main()
