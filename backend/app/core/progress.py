"""
Progress Tracking Utility
Centralized progress and status management for document processing.
"""
import logging
from app.core.supabase_client import supabase_admin

logger = logging.getLogger(__name__)


def update_document_status(
    user_id: str,
    document_id: str,
    status: str,
    progress: int = None,
    error: str = None
):
    """
    Update document status and optional progress in database.
    
    Args:
        user_id: Document owner
        document_id: Document ID
        status: "processing", "completed", or "failed"
        progress: 0-100 progress percentage
        error: Error message if status is "failed"
    """
    try:
        update_data = {"status": status}
        
        if progress is not None:
            update_data["progress"] = progress
        
        if error:
            update_data["error"] = error

        try:
            supabase_admin.table("documents").update(
                update_data
            ).eq("id", document_id).eq("user_id", user_id).execute()
        except Exception as update_error:
            if error and "error" in update_data:
                logger.warning(
                    "Retrying document update without error field | document_id=%s reason=%s",
                    document_id,
                    update_error,
                )
                update_data.pop("error", None)
                supabase_admin.table("documents").update(
                    update_data
                ).eq("id", document_id).eq("user_id", user_id).execute()
            else:
                raise

        logger.debug("Updated %s: status=%s, progress=%s", document_id, status, progress)
        
    except Exception as e:
        logger.error("Failed to update document %s: %s", document_id, e)


def mark_processing(user_id: str, document_id: str, progress: int = 0):
    """Mark document as processing."""
    update_document_status(user_id, document_id, "processing", progress)


def mark_completed(user_id: str, document_id: str):
    """Mark document as completed."""
    update_document_status(user_id, document_id, "completed", progress=100)


def mark_failed(user_id: str, document_id: str, error: str):
    """Mark document as failed with error message."""
    update_document_status(user_id, document_id, "failed", progress=0, error=error)
