import { useMemo } from "react";
import { useChatStore } from "../store/useChatStore";

export function useChat(sessionId?: string | null) {
  const messagesBySession = useChatStore((s) => s.messages);
  const storeSessionId = useChatStore((s) => s.activeSessionId);
  const activeSessionId = sessionId ?? storeSessionId;

  const ordered = useMemo(() => {
    const messages = activeSessionId ? messagesBySession[activeSessionId] ?? [] : [];
    return [...messages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [messagesBySession, activeSessionId]);

  return { messages: ordered, sessionId: activeSessionId };
}
