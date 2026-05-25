export type ErrorContext = "generic" | "chat" | "polling" | "documents" | "auth";

export type NormalizedError = {
  kind: "network" | "backend" | "polling" | "auth" | "unknown";
  message: string;
  retryable: boolean;
  status?: number;
  rawMessage: string;
};

type ErrorHandlerOptions = {
  context?: ErrorContext;
};

export function normalizeError(err: unknown, options: ErrorHandlerOptions = {}): NormalizedError {
  const rawMessage = extractRawMessage(err);
  const status = extractStatus(err);
  const lower = rawMessage.toLowerCase();
  const context = options.context ?? "generic";

  if (status === 401 || lower.includes("unauthorized") || lower.includes("session expired")) {
    return {
      kind: "auth",
      message: "Authentication required. Please sign in.",
      retryable: false,
      status,
      rawMessage,
    };
  }

  if (
    lower.includes("failed to fetch") ||
    lower.includes("network error") ||
    lower.includes("networkerror") ||
    lower.includes("fetch failed") ||
    lower.includes("load failed") ||
    lower.includes("connection")
  ) {
    return {
      kind: context === "polling" ? "polling" : "network",
      message:
        context === "polling"
          ? "Document polling hit a network error. Retrying soon."
          : "Network error. Please check your connection.",
      retryable: true,
      status,
      rawMessage,
    };
  }

  if (context === "polling" && status && status >= 500) {
    return {
      kind: "polling",
      message: `Document polling failed on the server (${status}). Retrying soon.`,
      retryable: true,
      status,
      rawMessage,
    };
  }

  if (status === 429) {
    return {
      kind: "backend",
      message: "Too many requests. Please wait a moment and try again.",
      retryable: true,
      status,
      rawMessage,
    };
  }

  if (status && status >= 500) {
    return {
      kind: "backend",
      message: "Server error. Please try again.",
      retryable: true,
      status,
      rawMessage,
    };
  }

  if (status && status >= 400) {
    return {
      kind: "backend",
      message: rawMessage || `Request failed (${status}). Please try again.`,
      retryable: status === 408 || status === 429,
      status,
      rawMessage,
    };
  }

  return {
    kind: "unknown",
    message: rawMessage || "Something went wrong. Please try again.",
    retryable: true,
    status,
    rawMessage,
  };
}

export function handleError(err: unknown, options: ErrorHandlerOptions = {}): string {
  const normalized = normalizeError(err, options);
  console.error("NeuralDoc error:", err, normalized);
  return normalized.message;
}

function extractRawMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object") {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return String(err ?? "Unknown error");
}

function extractStatus(err: unknown): number | undefined {
  if (!err || typeof err !== "object") return undefined;

  const candidate = err as { status?: unknown; response?: { status?: unknown } };
  if (typeof candidate.status === "number") return candidate.status;
  if (candidate.response && typeof candidate.response.status === "number") return candidate.response.status;

  return undefined;
}
