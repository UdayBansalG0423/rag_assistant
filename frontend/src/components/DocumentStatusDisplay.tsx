import React from "react";
import { AlertCircle, CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentStatusDisplayProps {
  status?: "processing" | "completed" | "failed";
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
  if (status === "processing") {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/70">Processing</span>
          <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
              style={{ width: `${Math.min(progress || 0, 100)}%` }}
            />
          </div>
          <span className="text-xs text-white/50 w-8">{progress}%</span>
        </div>
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-green-400" />
        <span className="text-sm text-green-400">Ready</span>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-red-400 truncate">Failed</p>
          {error && <p className="text-xs text-white/40 truncate">{error}</p>}
        </div>
        {onRetry && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onRetry}
            className="gap-1 text-xs"
          >
            <RotateCcw className="h-3 w-3" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  return null;
}
