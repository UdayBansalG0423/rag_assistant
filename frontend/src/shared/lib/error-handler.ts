export function handleError(err: unknown): string {
  const msg = (err as any)?.message ?? String(err ?? "Unknown error");
  console.error("NeuralDoc error:", err);
  return mapToUserMessage(msg);
}

function mapToUserMessage(raw: string): string {
  if (raw.includes("Network")) return "Network error. Please check your connection.";
  if (raw.includes("401") || raw.toLowerCase().includes("unauthorized")) return "Authentication required. Please sign in.";
  return "Failed to retrieve response. Please try again.";
}
