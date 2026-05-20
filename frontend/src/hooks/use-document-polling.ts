import { useEffect, useState, useRef } from "react";
import { getDocuments } from "@/lib/api";
import type { DocumentRecord } from "@/lib/api";

interface UseDocumentPollingOptions {
  /** Poll interval in milliseconds (default: 2000ms) */
  pollInterval?: number;
  /** Enable/disable polling (default: true) */
  enabled?: boolean;
  /** Stop polling when all documents are completed (default: true) */
  stopWhenComplete?: boolean;
}

/**
 * Custom hook for polling documents from the backend.
 * Automatically polls for updated document status and progress.
 */
export function useDocumentPolling({
  pollInterval = 2000,
  enabled = true,
  stopWhenComplete = true,
}: UseDocumentPollingOptions = {}) {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fetchDocuments = async () => {
    try {
      const response = await getDocuments();
      setDocuments(response.documents || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  const hasProcessing = () => {
    return documents.some(doc => doc.status === "queued" || doc.status === "processing");
  };

  useEffect(() => {
    if (!enabled) {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
      return;
    }

    // Initial fetch
    fetchDocuments();

    // Setup polling
    const poll = () => {
      fetchDocuments().then(() => {
        // Check if we should stop polling
        if (stopWhenComplete && !hasProcessing()) {
          return; // Stop polling
        }

        // Schedule next poll
        pollTimeoutRef.current = setTimeout(poll, pollInterval);
      });
    };

    // Start polling after initial fetch
    pollTimeoutRef.current = setTimeout(poll, pollInterval);

    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [enabled, pollInterval, stopWhenComplete]);

  const refresh = async () => {
    await fetchDocuments();
  };

  return {
    documents,
    loading,
    error,
    refresh,
    hasProcessing: hasProcessing(),
  };
}
