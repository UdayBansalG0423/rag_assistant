import os

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.core.clients.redis_client import redis_client
from app.core.supabase_client import supabase_admin


router = APIRouter()


@router.get("/health")
def health_check():
    health_status = {
        "backend": "healthy",
    }

    # Redis health
    try:
        redis_client.ping()
        health_status["redis"] = "healthy"
    except Exception as exc:
        health_status["redis"] = {
            "status": "unhealthy",
            "error": str(exc),
        }

    # Supabase health
    try:
        # Lightweight check against a known table with limit 1
        supabase_admin.table("profiles").select("id").limit(1).execute()
        health_status["supabase"] = "healthy"
    except Exception as exc:
        health_status["supabase"] = {
            "status": "unhealthy",
            "error": str(exc),
        }

    # Pinecone health
    vector_provider = os.getenv("VECTOR_DB_PROVIDER", "faiss").lower()
    if vector_provider != "pinecone":
        health_status["pinecone"] = {
            "status": "skipped",
            "reason": "VECTOR_DB_PROVIDER is not pinecone",
        }
    else:
        try:
            from pinecone import Pinecone

            api_key = os.getenv("PINECONE_API_KEY")
            index_name = os.getenv("PINECONE_INDEX", "neuraldoc-index")
            pc = Pinecone(api_key=api_key)
            index = pc.Index(index_name)
            index.describe_index_stats()
            health_status["pinecone"] = "healthy"
        except Exception as exc:
            health_status["pinecone"] = {
                "status": "unhealthy",
                "error": str(exc),
            }

    failed_components = []
    for component, state in health_status.items():
        if component == "backend":
            continue
        if isinstance(state, dict):
            if state.get("status") == "unhealthy":
                failed_components.append(component)
        elif state == "unhealthy":
            failed_components.append(component)

    if failed_components:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "failed_components": failed_components,
                "services": health_status,
            },
        )

    return {
        "status": "healthy",
        "services": health_status,
    }
