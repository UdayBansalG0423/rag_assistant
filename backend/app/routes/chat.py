from fastapi import APIRouter, Depends

from app.schemas.chat import (
    ChatHistoryResponse,
    ChatSessionCreateResponse,
    ChatSessionListResponse,
    SaveChatMessageRequest,
    SaveChatMessageResponse,
)
from app.services.auth.auth_service import get_current_user_from_credentials
from app.services.chat.chat_service import ChatService


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
def save_message(
    request: SaveChatMessageRequest,
    current_user=Depends(get_current_user_from_credentials),
):
    return chat_service.save_message(
        user_id=current_user.id,
        session_id=request.session_id,
        user_query=request.user_query,
        assistant_response=request.assistant_response,
        sources=request.sources,
        latency=request.latency,
        title=request.title,
    )


@router.get("/{session_id}", response_model=ChatHistoryResponse)
def load_history(
    session_id: str,
    current_user=Depends(get_current_user_from_credentials),
):
    return chat_service.load_history(current_user.id, session_id)
