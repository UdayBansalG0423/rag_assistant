import { clearStoredToken, getStoredToken } from "./auth";

type Credentials = {
  username: string;
  password: string;
};

type AuthResponse = {
  access_token: string;
  token_type: string;
};

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const token = getStoredToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, {
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
    throw new Error(body || `Request failed (${res.status})`);
  }

  return res.json() as Promise<T>;
}

// ── helpers ──────────────────────────────────────────────────────────────────

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = getStoredToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function registerUser(credentials: Credentials): Promise<{ message: string }> {
  return request("/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
}

export async function loginUser(credentials: Credentials): Promise<AuthResponse> {
  return request("/api/login", {
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
): Promise<{ status: string; filename: string }> {
  const headers = await getAuthHeaders();
  const form = new FormData();
  form.append('file', file);

  return request('/api/upload', {
    method: 'POST',
    headers,          // Content-Type is set automatically by the browser for FormData
    body: form,
  });
}

/** Ask a question against the indexed knowledge base. */
export async function askQuery(
  query: string,
): Promise<{ answer: string; sources: string[]; latency: number }> {
  const headers = await getAuthHeaders();
  const result = await request<{ answer?: string; sources?: string[]; latency?: number } | string>(`/api/ask?q=${encodeURIComponent(query)}`, {
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
export async function getDocuments(): Promise<{ documents: any[] }> {
  const headers = await getAuthHeaders();
  return request('/api/documents', { headers });
}

/** Check whether any documents have been indexed. */
export async function getStatus(): Promise<{ documents_indexed: boolean }> {
  const headers = await getAuthHeaders();
  return request('/api/status', { headers });
}
