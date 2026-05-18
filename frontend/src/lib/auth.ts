const AUTH_TOKEN_KEY = "rag_auth_token";
const REFRESH_TOKEN_KEY = "rag_refresh_token";
const USER_ID_KEY = "rag_user_id";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  username?: string;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setStoredRefreshToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function getStoredUserId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(USER_ID_KEY);
}

export function setStoredUserId(userId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USER_ID_KEY, userId);
}

export function clearStoredToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(USER_ID_KEY);
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

    const decoded = JSON.parse(base64UrlDecode(payload)) as {
      sub?: string;
      email?: string;
      user_metadata?: { name?: string };
    };
    
    // Supabase JWT uses 'sub' for user ID
    const userId = decoded.sub;
    const email = decoded.email;
    const name = decoded.user_metadata?.name;
    
    if (!userId || !email) return null;

    return {
      id: userId,
      email,
      name,
      username: name ?? email.split("@")[0],
    };
  } catch {
    return null;
  }
}
