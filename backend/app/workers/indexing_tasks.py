from app.workers.celery_app import celery_app
from app.core.progress import update_document_status
from app.core.logger import logger
import os

app = celery_app
celery = celery_app

@celery_app.task(bind=True, max_retries=3)
def process_document(
    self,
    file_path,
    user_id,
    document_id
):
    logger.info(
        "Task received | document_id=%s user_id=%s retry=%s/%s",
        document_id,
        user_id,
        self.request.retries,
        self.max_retries,
    )
    update_document_status(user_id, document_id, "processing", progress=10)
    logger.info("Indexing started | document_id=%s user_id=%s", document_id, user_id)

    # Lazy import/instantiation to avoid import-time side-effects
    from app.services.rag.rag_service import RAGService
    rag_service = RAGService()

    def on_stage(stage: str):
        stage_progress_map = {
            "extraction_complete": 30,
            "chunking_complete": 50,
            "embedding_started": 80,
            "upsert_complete": 100,
        }

        progress = stage_progress_map.get(stage)
        if progress is None:
            return

        if stage == "upsert_complete":
            update_document_status(user_id, document_id, "completed", progress=100)
        else:
            update_document_status(user_id, document_id, "processing", progress=progress)
        logger.info(
            "Pipeline stage | document_id=%s user_id=%s stage=%s progress=%s",
            document_id,
            user_id,
            stage,
            progress,
        )

    try:
        rag_service.index_pdf(
            path=file_path,
            user_id=user_id,
            document_id=document_id,
            stage_callback=on_stage,
        )

        # Ensure terminal completed state even if callback timing changes.
        update_document_status(user_id, document_id, "completed", progress=100)
        logger.info("Indexing completed | document_id=%s user_id=%s", document_id, user_id)
    except Exception as exc:
        if self.request.retries < self.max_retries:
            retry_in_seconds = 10
            retry_attempt = self.request.retries + 1
            logger.warning(
                "Retrying task due to error | document_id=%s user_id=%s attempt=%s/%s in=%ss error=%s",
                document_id,
                user_id,
                retry_attempt,
                self.max_retries,
                retry_in_seconds,
                str(exc),
            )
            raise self.retry(exc=exc, countdown=retry_in_seconds)

        update_document_status(user_id, document_id, "failed", progress=0, error=str(exc))
        logger.exception(
            "Indexing failed permanently | document_id=%s user_id=%s retries=%s",
            document_id,
            user_id,
            self.request.retries,
        )
        raise
    finally:
        try:
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
                logger.info("Removed temp upload file | document_id=%s path=%s", document_id, file_path)
        except Exception as cleanup_exc:
            logger.warning(
                "Failed to remove temp upload file | document_id=%s path=%s error=%s",
                document_id,
                file_path,
                cleanup_exc,
            )