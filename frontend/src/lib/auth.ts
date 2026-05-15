const AUTH_TOKEN_KEY = "rag_auth_token";

export interface AuthUser {
  username: string;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearStoredToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
}

export function decodeAuthToken(token: string): AuthUser | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const decoded = JSON.parse(base64UrlDecode(payload)) as { sub?: string };
    if (!decoded.sub) return null;

    return { username: decoded.sub };
  } catch {
    return null;
  }
}
