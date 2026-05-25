import { ChatMessage } from "../types/chat.types";

export interface UIMessage extends ChatMessage {}

function resolveTimestamp(raw: any): string {
  return raw?.timestamp ?? raw?.created_at ?? raw?.createdAt ?? new Date().toISOString();
}

export function adaptBackendMessage(raw: any): UIMessage {
  const role = raw?.role === "assistant" ? "assistant" : "user";

  return {
    id: raw?.id ?? `${role}-${Date.now()}`,
    role,
    content: raw?.content ?? raw?.assistant_response ?? raw?.user_query ?? "",
    sources: raw?.sources ?? [],
    latency: raw?.latency ?? null,
    timestamp: resolveTimestamp(raw),
    status: raw?.status ?? "sent",
  };
}

export function adaptChatTurn(raw: any): UIMessage {
  return adaptBackendMessage(raw);
}

export function createOptimisticUserMessage(content: string): UIMessage {
  return {
    id: `user-${Date.now()}`,
    role: "user",
    content,
    sources: [],
    latency: null,
    timestamp: new Date().toISOString(),
    status: "sent",
  };
}

export function createPendingAssistantMessage(): UIMessage {
  return {
    id: `assistant-pending-${Date.now()}`,
    role: "assistant",
    content: "",
    sources: [],
    latency: null,
    timestamp: new Date().toISOString(),
    status: "pending",
  };
}

export function formatRelativeTime(value?: string | null): string {
  if (!value) return "";

  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "";

  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;

  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
}
