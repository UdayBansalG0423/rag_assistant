from datetime import datetime
import uuid

from fastapi import HTTPException
from postgrest.exceptions import APIError

from app.core.supabase_client import supabase_admin


class ChatService:
    @staticmethod
    def _raise_if_schema_missing(error: Exception) -> None:
        if isinstance(error, APIError):
            payload = getattr(error, "json", None)
            if callable(payload):
                payload = payload()
            code = payload.get("code") if isinstance(payload, dict) else None
            message = payload.get("message") if isinstance(payload, dict) else str(error)

            if code == "PGRST205":
                raise HTTPException(
                    status_code=500,
                    detail=(
                        "Supabase chat tables are missing in schema cache. "
                        "Create `chat_sessions` and `chat_messages`, then refresh the Supabase API schema cache."
                    ),
                )

            raise HTTPException(status_code=500, detail=f"Supabase API error: {message}")

        raise HTTPException(status_code=500, detail="Unexpected chat service error")

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

        try:
            supabase_admin.table("chat_sessions").insert(record).execute()
        except Exception as exc:
            self._raise_if_schema_missing(exc)
        return record

    def list_sessions(self, user_id: str):
        try:
            response = (
                supabase_admin.table("chat_sessions")
                .select("*")
                .eq("user_id", user_id)
                .order("updated_at", desc=True)
                .execute()
            )
        except Exception as exc:
            self._raise_if_schema_missing(exc)
        return response.data or []

    def delete_session(self, user_id: str, session_id: str):
        try:
            session_response = (
                supabase_admin.table("chat_sessions")
                .select("id")
                .eq("id", session_id)
                .eq("user_id", user_id)
                .single()
                .execute()
            )
        except Exception as exc:
            self._raise_if_schema_missing(exc)

        if not session_response.data:
            raise HTTPException(status_code=404, detail="Chat session not found")

        try:
            supabase_admin.table("chat_sessions").delete().eq("id", session_id).eq("user_id", user_id).execute()
        except Exception as exc:
            self._raise_if_schema_missing(exc)

        return {"message": "Chat session deleted", "id": session_id}

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
        try:
            session_response = (
                supabase_admin.table("chat_sessions")
                .select("*")
                .eq("id", session_id)
                .eq("user_id", user_id)
                .single()
                .execute()
            )
        except Exception as exc:
            self._raise_if_schema_missing(exc)

        session = session_response.data
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")

        now = datetime.utcnow().isoformat()
        session_title = session.get("title") or "New chat"
        if session_title == "New chat" and title:
            session_title = title.strip() or session_title

        try:
            supabase_admin.table("chat_sessions").update({
                "title": session_title,
                "updated_at": now,
            }).eq("id", session_id).eq("user_id", user_id).execute()
        except Exception as exc:
            self._raise_if_schema_missing(exc)

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

        try:
            supabase_admin.table("chat_messages").insert(record).execute()
        except Exception as exc:
            self._raise_if_schema_missing(exc)
        return record

    def load_history(self, user_id: str, session_id: str):
        try:
            session_response = (
                supabase_admin.table("chat_sessions")
                .select("*")
                .eq("id", session_id)
                .eq("user_id", user_id)
                .single()
                .execute()
            )
        except Exception as exc:
            self._raise_if_schema_missing(exc)
        session = session_response.data
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")

        try:
            response = (
                supabase_admin.table("chat_messages")
                .select("*")
                .eq("session_id", session_id)
                .eq("user_id", user_id)
                .order("created_at", desc=False)
                .execute()
            )
        except Exception as exc:
            self._raise_if_schema_missing(exc)

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

        return {"session": session, "messages": messages}
