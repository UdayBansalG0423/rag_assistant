import { ChatMessage } from "../types/chat.types";

export async function ask(query: string): Promise<any> {
  const res = await fetch(`/ask?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Network error while asking");
  return res.json();
}

export async function persistMessage(sessionId: string, message: ChatMessage) {
  const payload = {
    session_id: sessionId,
    user_query: message.role === "user" ? message.content : undefined,
    assistant_response: message.role === "assistant" ? message.content : undefined,
    sources: message.sources ?? [],
    latency: message.latency,
    title: message.content?.slice?.(0, 120) ?? undefined,
  } as any;

  const res = await fetch(`/chat/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to persist message");
  return res.json();
}
