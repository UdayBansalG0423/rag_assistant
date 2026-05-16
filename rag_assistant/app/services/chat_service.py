from datetime import datetime
from fastapi import HTTPException
from app.core.supabase_client import supabase_admin
import uuid


class ChatService:
    def create_session(self, user_id: str, title: str | None = None):
        session_id = str(uuid.uuid4())
        session_title = (title or "New chat").strip() or "New chat"

        record = {
            "id": session_id,
            "user_id": user_id,
            "title": session_title,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }

        supabase_admin.table("chat_sessions").insert(record).execute()
        return record

    def list_sessions(self, user_id: str):
        response = (
            supabase_admin.table("chat_sessions")
            .select("*")
            .eq("user_id", user_id)
            .order("updated_at", desc=True)
            .execute()
        )
        return response.data or []

    def save_message(
        self,
        user_id: str,
        session_id: str,
        user_query: str,
        assistant_response: str,
        sources: list[str] | None = None,
        latency: float | None = None,
        title: str | None = None,
    ):
        session_response = (
            supabase_admin.table("chat_sessions")
            .select("*")
            .eq("id", session_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )

        session = session_response.data
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")

        now = datetime.utcnow().isoformat()
        session_title = session.get("title") or "New chat"
        if session_title == "New chat" and title:
            session_title = title.strip() or session_title

        supabase_admin.table("chat_sessions").update({
            "title": session_title,
            "updated_at": now,
        }).eq("id", session_id).eq("user_id", user_id).execute()

        message_id = str(uuid.uuid4())
        record = {
            "id": message_id,
            "session_id": session_id,
            "user_id": user_id,
            "user_query": user_query,
            "assistant_response": assistant_response,
            "sources": sources or [],
            "latency": latency,
            "created_at": now,
        }

        supabase_admin.table("chat_messages").insert(record).execute()
        return record

    def load_history(self, user_id: str, session_id: str):
        session_response = (
            supabase_admin.table("chat_sessions")
            .select("*")
            .eq("id", session_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        session = session_response.data
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")

        response = (
            supabase_admin.table("chat_messages")
            .select("*")
            .eq("session_id", session_id)
            .eq("user_id", user_id)
            .order("created_at", desc=False)
            .execute()
        )

        exchanges = response.data or []
        messages = []
        for exchange in exchanges:
            created_at = exchange.get("created_at")
            messages.append({
                "id": f"{exchange['id']}-user",
                "role": "user",
                "content": exchange.get("user_query", ""),
                "sources": [],
                "latency": None,
                "timestamp": created_at,
            })
            messages.append({
                "id": f"{exchange['id']}-assistant",
                "role": "assistant",
                "content": exchange.get("assistant_response", ""),
                "sources": exchange.get("sources") or [],
                "latency": exchange.get("latency"),
                "timestamp": created_at,
            })

        return {
            "session": session,
            "messages": messages,
        }