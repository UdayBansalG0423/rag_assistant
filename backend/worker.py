"""
Async Worker - Processes document indexing tasks from Redis queue.
Run this in a separate terminal: python worker.py
"""
import os
import sys
import logging

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.queue import dequeue_task
from app.core.progress import update_document_status, mark_completed, mark_failed
from app.services.rag.orchestrator import RAGService

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

rag_service = RAGService()

logger.info("🚀 Worker started. Listening for tasks...")



def process_task(task: dict):
    """Process a single indexing task with progress tracking."""
    file_path = task.get("file_path")
    user_id = task.get("user_id")
    document_id = task.get("document_id")
    temp_file = task.get("temp_file", False)

    try:
        logger.info(f"📄 Processing document: {document_id} for user: {user_id}")
        
        # Stage 1: Text extraction
        logger.info(f"[1/4] Extracting text...")
        update_document_status(user_id, document_id, "processing", progress=20)

        # Stage 2: Chunking
        logger.info(f"[2/4] Chunking text...")
        update_document_status(user_id, document_id, "processing", progress=50)

        # Stage 3: Embedding & Indexing
        logger.info(f"[3/4] Generating embeddings...")
        update_document_status(user_id, document_id, "processing", progress=80)

        # Index the PDF - this is the main blocking operation
        rag_service.index_pdf(
            file_path=file_path,
            user_id=user_id,
            document_id=document_id
        )

        # Stage 4: Completion
        logger.info(f"[4/4] Finalizing...")
        mark_completed(user_id, document_id)

        logger.info(f"✅ Indexing completed for document: {document_id}")

    except Exception as e:
        logger.error(f"❌ Worker error processing {document_id}: {str(e)}", exc_info=True)
        mark_failed(user_id, document_id, str(e))
        logger.error(f"Document {document_id} marked as FAILED")

    finally:
        # Clean up temporary file
        if temp_file and os.path.exists(file_path):
            try:
                os.remove(file_path)
                logger.info(f"🗑️ Cleaned up temp file: {file_path}")
            except Exception as e:
                logger.error(f"Failed to delete temp file: {str(e)}")


if __name__ == "__main__":
    try:
        while True:
            try:
                # Blocking wait for task from queue
                task = dequeue_task()
                logger.info(f"📬 Received task: {task}")
                process_task(task)

            except ValueError:
                # No task available (timeout)
                continue
            except Exception as e:
                logger.error(f"Unexpected error: {str(e)}", exc_info=True)
                continue

    except KeyboardInterrupt:
        logger.info("⛔ Worker stopped")
        sys.exit(0)
