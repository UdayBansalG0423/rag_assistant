import { useMemo } from "react";
import { useChatStore } from "../store/useChatStore";

export function useChat() {
  const messagesBySession = useChatStore((s) => s.messages);
  const sessionId = useChatStore((s) => s.activeSessionId);

  const ordered = useMemo(() => {
    const messages = sessionId ? messagesBySession[sessionId] ?? [] : [];
    return [...messages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [messagesBySession, sessionId]);

  return { messages: ordered, sessionId };
}
