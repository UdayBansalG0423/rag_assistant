export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  latency?: number | null;
  timestamp: string;
  status?: "sent" | "pending" | "error";
};

export type ChatSession = {
  id: string;
  user_id?: string;
  title?: string;
  created_at?: string | null;
  updated_at?: string | null;
};
