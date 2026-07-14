import {
  clearStoredToken,
  getStoredToken,
} from "./auth";
import { normalizeError } from "@/shared/lib/error-handler";

const apiBaseUrl = (() => {
  const configured = import.meta.env.VITE_BACKEND_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return import.meta.env.DEV ? "http://localhost:8000" : "";
})();

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return apiBaseUrl ? `${apiBaseUrl}${normalizedPath}` : normalizedPath;
}

type SignUpCredentials = {
  name: string;
  email: string;
  password: string;
};

type LoginCredentials = {
  email: string;
  password: string;
};

type AuthResponse = {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email: string;
  token_type: string;
};

export type DocumentRecord = {
  id: string;
  user_id: string;
  file_name?: string;
  filename: string;
  name?: string;
  storage_path: string;
  status?: "queued" | "processing" | "completed" | "failed";
  progress?: number;
  error?: string;
  created_at?: string | null;
};

type ChatSessionRecord = {
  id: string;
  user_id: string;
  title: string;
  created_at?: string | null;
  updated_at?: string | null;
};

type ChatMessageRecord = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  latency?: number | null;
  timestamp?: string | null;
};

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const token = getStoredToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const res = await fetch(apiUrl(url), {
      ...options,
      headers,
    });

    if (res.status === 401) {
      clearStoredToken();
      window.location.href = "/login";
      throw new Error("Session expired — redirecting to login.");
    }

    if (!res.ok) {
      const body = await res.text();
      let message = body || `Request failed (${res.status})`;

      try {
        const parsed = body ? JSON.parse(body) : null;
        message = parsed?.detail || parsed?.message || message;
      } catch {
        // Keep the text body when JSON parsing fails.
      }

      const normalized = normalizeError({ message, status: res.status }, { context: "generic" });
      throw new Error(normalized.message);
    }

    return res.json() as Promise<T>;
  } catch (err) {
    const normalized = normalizeError(err, { context: "generic" });
    throw new Error(normalized.message);
  }
}

// ── helpers ──────────────────────────────────────────────────────────────────

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = getStoredToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function registerUser(
  credentials: SignUpCredentials,
): Promise<{ message: string; user_id: string; email: string }> {
  return request("/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
}

export async function loginUser(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  return request("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
}

// ── typed API functions ──────────────────────────────────────────────────────

/** Upload a PDF file to the backend for indexing. */
export async function uploadPdf(
  file: File,
): Promise<{ message: string; filename: string; id: string; user_id: string; storage_path: string }> {
  const headers = await getAuthHeaders();
  const form = new FormData();
  form.append('file', file);

  return request('/upload', {
    method: 'POST',
    headers,          // Content-Type is set automatically by the browser for FormData
    body: form,
  });
}

/** Retry processing a failed document. */
export async function retryDocument(
  documentId: string,
): Promise<{ id: string; message: string; status: string }> {
  const headers = await getAuthHeaders();
  return request(`/upload/retry/${documentId}`, {
    method: 'POST',
    headers,
  });
}

/** Ask a question against the indexed knowledge base. */
export async function askQuery(
  query: string,
): Promise<{ answer: string; sources: string[]; latency: number }> {
  const headers = await getAuthHeaders();
  const result = await request<{ answer?: string; sources?: string[]; latency?: number } | string>(`/ask?q=${encodeURIComponent(query)}`, {
    headers,
  });

  if (typeof result === "string") {
    return { answer: result, sources: [], latency: 0 };
  }

  return {
    answer: result.answer ?? "No response received.",
    sources: result.sources ?? [],
    latency: result.latency ?? 0,
  };
}

/** Retrieve the list of indexed documents. */
export async function getDocuments(): Promise<{ documents: DocumentRecord[] }> {
  const headers = await getAuthHeaders();
  return request('/documents', { headers });
}

export async function createChatSession(): Promise<ChatSessionRecord> {
  const headers = await getAuthHeaders();
  return request('/chat/session', {
    method: 'POST',
    headers,
  });
}

export async function getChatSessions(): Promise<{ sessions: ChatSessionRecord[] }> {
  const headers = await getAuthHeaders();
  return request('/chat/sessions', { headers });
}

export async function deleteChatSession(sessionId: string): Promise<{ message: string; id: string }> {
  const headers = await getAuthHeaders();
  return request(`/chat/session/${sessionId}`, {
    method: 'DELETE',
    headers,
  });
}

export async function saveChatMessage(payload: {
  session_id: string;
  user_query: string;
  assistant_response: string;
  sources?: string[];
  latency?: number;
  title?: string;
}): Promise<{ id: string; session_id: string; user_id: string }> {
  const headers = await getAuthHeaders();
  return request('/chat/message', {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export async function getChatHistory(sessionId: string): Promise<{
  session: ChatSessionRecord;
  messages: ChatMessageRecord[];
}> {
  const headers = await getAuthHeaders();
  return request(`/chat/${sessionId}`, { headers });
}
