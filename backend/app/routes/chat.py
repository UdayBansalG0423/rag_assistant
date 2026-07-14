from fastapi import APIRouter, Depends, Request, Response

from app.schemas.chat import (
    ChatHistoryResponse,
    ChatSessionCreateResponse,
    ChatSessionListResponse,
    SaveChatMessageRequest,
    SaveChatMessageResponse,
)
from app.services.auth.auth_service import get_current_user_from_credentials
from app.services.chat.chat_service import ChatService
from app.core.rate_limiter import limiter


router = APIRouter(prefix="/chat")
chat_service = ChatService()


@router.post("/session", response_model=ChatSessionCreateResponse)
def create_session(current_user=Depends(get_current_user_from_credentials)):
    return chat_service.create_session(current_user.id)


@router.get("/sessions", response_model=ChatSessionListResponse)
def list_sessions(current_user=Depends(get_current_user_from_credentials)):
    return {"sessions": chat_service.list_sessions(current_user.id)}


@router.delete("/session/{session_id}")
def delete_session(
    session_id: str,
    current_user=Depends(get_current_user_from_credentials),
):
    return chat_service.delete_session(current_user.id, session_id)


@router.post("/message", response_model=SaveChatMessageResponse)
@limiter.limit("60/minute")
def save_message(
    request: Request,
    response: Response,
    payload: SaveChatMessageRequest,
    current_user=Depends(get_current_user_from_credentials),
):
    return chat_service.save_message(
        user_id=current_user.id,
        session_id=payload.session_id,
        user_query=payload.user_query,
        assistant_response=payload.assistant_response,
        sources=payload.sources,
        latency=payload.latency,
        title=payload.title,
    )


@router.get("/{session_id}", response_model=ChatHistoryResponse)
def load_history(
    session_id: str,
    current_user=Depends(get_current_user_from_credentials),
):
    return chat_service.load_history(current_user.id, session_id)
