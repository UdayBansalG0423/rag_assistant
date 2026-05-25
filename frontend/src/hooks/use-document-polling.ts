import { useCallback, useEffect, useRef, useState } from "react";
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
  const [retryCount, setRetryCount] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const pollTimeoutRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);
  const docsRef = useRef<DocumentRecord[]>([]);

  const hasProcessing = useCallback((docs?: DocumentRecord[]) => {
    const toCheck = docs ?? docsRef.current;
    return toCheck.some(doc => doc.status === "queued" || doc.status === "processing");
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      setIsFetching(true);
      const response = await getDocuments();
      const docs = response.documents || [];
      docsRef.current = docs;
      setDocuments(docs);
      setError(null);
      setRetryCount(0);
      return docs;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch documents";
      setError(message);
      setRetryCount((count) => count + 1);
      return null;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setIsFetching(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (!enabled) {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
      return;
    }

    let cancelled = false;

    const scheduleNextPoll = (docs: DocumentRecord[]) => {
      if (cancelled) return;
      if (stopWhenComplete && !hasProcessing(docs)) {
        return;
      }

      pollTimeoutRef.current = setTimeout(async () => {
        const newDocs = await fetchDocuments();
        if (newDocs !== null) {
          scheduleNextPoll(newDocs);
        }
      }, pollInterval);
    };

    void fetchDocuments().then((docs) => {
      if (docs !== null) {
        scheduleNextPoll(docs);
      }
    });

    return () => {
      cancelled = true;
      mountedRef.current = false;
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [enabled, pollInterval, stopWhenComplete, fetchDocuments, hasProcessing]);

  const refresh = async () => {
    await fetchDocuments();
  };

  const retry = async () => {
    await fetchDocuments();
  };

  const polling = isFetching;

  return {
    documents,
    loading,
    error,
    refresh,
    retry,
    hasProcessing: hasProcessing(documents),
    polling,
    retryCount,
  };
}
