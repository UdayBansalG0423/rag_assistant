from pydantic import BaseModel
from typing import Any, List, Optional


class ChatSessionCreateResponse(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class ChatSessionRecord(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class ChatMessageRecord(BaseModel):
    id: str
    role: str
    content: str
    sources: List[str] = []
    latency: Optional[float] = None
    timestamp: Optional[str] = None


class SaveChatMessageRequest(BaseModel):
    session_id: str
    user_query: str
    assistant_response: str
    sources: List[str] = []
    latency: Optional[float] = None
    title: Optional[str] = None


class SaveChatMessageResponse(BaseModel):
    id: str
    session_id: str
    user_id: str
    user_query: str
    assistant_response: str
    sources: List[str] = []
    latency: Optional[float] = None
    created_at: Optional[str] = None


class ChatHistoryResponse(BaseModel):
    session: ChatSessionRecord
    messages: List[ChatMessageRecord]


class ChatSessionListResponse(BaseModel):
    sessions: List[ChatSessionRecord]