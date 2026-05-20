import React from "react";
import { AlertCircle, CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentStatusDisplayProps {
  status?: "queued" | "processing" | "completed" | "failed";
  progress?: number;
  error?: string;
  onRetry?: () => void;
}

/**
 * Display component for document status with appropriate UI
 * Shows:
 * - Spinner + progress for "processing"
 * - Checkmark for "completed"
 * - Error icon + retry button for "failed"
 */
export function DocumentStatusDisplay({
  status = "processing",
  progress = 0,
  error,
  onRetry,
}: DocumentStatusDisplayProps) {
  // Minimal, compact status visuals: small dot + optional spinner
  if (status === "queued") {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="text-white/60">Queued</span>
      </div>
    );
  }

  if (status === "processing") {
    return (
      <div className="flex items-center gap-2 text-xs">
        <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
        <span className="text-white/70">Processing</span>
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-400" />
        <span className="text-green-300">Ready</span>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex items-center gap-3 text-xs">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-red-300 truncate">Failed</p>
          {error && <p className="text-[11px] text-white/40 truncate">{error}</p>}
        </div>
        {onRetry && (
          <Button size="sm" variant="ghost" onClick={onRetry} className="gap-1 text-xs">
            <RotateCcw className="h-3 w-3" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  return null;
}
