import { Copy, ThumbsDown, ThumbsUp, AlertCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useEffect, useState } from 'react'
import type { ChatMessage } from '../types/chat.types'

function SourceChip({ source, label }: { source: string; label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border-default bg-bg-overlay px-2.5 py-1 text-[11px] text-text-secondary" title={source}>
      {label}
    </span>
  )
}

function PendingBubble({ startedAt }: { startedAt: string }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    const startedTime = new Date(startedAt).getTime()
    const tick = () => {
      const elapsed = Math.max(0, Math.floor((Date.now() - startedTime) / 1000))
      setElapsedSeconds(elapsed)
    }

    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [startedAt])

  return (
    <div className="flex items-start gap-3 px-6 py-2">
      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-accent bg-accent-glow text-xs text-text-primary shadow-[0_0_10px_rgba(108,99,255,0.18)]">
        ◈
      </div>
      <div className="flex w-fit items-center gap-2 rounded-2xl bg-bg-elevated px-4 py-3">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-muted" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-muted [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-muted [animation-delay:300ms]" />
        <span className="pl-1 text-[11px] font-mono text-text-muted">{elapsedSeconds}s</span>
      </div>
    </div>
  )
}

export default function MessageBubble({
  message,
  documentMap,
  onRetry,
}: {
  message: ChatMessage
  documentMap?: Map<string, string>
  onRetry?: () => void
}) {

  if (message.role === 'user') {
    return (
      <div className="flex justify-end px-6 py-2">
        <div className="max-w-[70%] rounded-[18px_18px_4px_18px] border border-border-default bg-bg-elevated px-4 py-3 text-sm leading-6 text-text-primary">
          {message.content}
        </div>
      </div>
    )
  }

  if (message.status === 'pending') {
    return <PendingBubble startedAt={message.timestamp} />
  }

  if (message.status === 'error') {
    return (
      <div className="flex items-start gap-3 px-6 py-2">
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-accent bg-accent-glow text-xs text-text-primary">
          ◈
        </div>
        <div className="flex max-w-[72%] items-center gap-3 rounded-xl border border-status-error/25 bg-status-error/10 px-3 py-2 text-sm text-status-error">
          <AlertCircle size={14} />
          <span>Something went wrong. Try sending again.</span>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-md border border-status-error/30 bg-status-error/15 px-2 py-1 text-[11px] font-medium text-status-error transition hover:bg-status-error/25"
            >
              Retry
            </button>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 px-6 py-2">
      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-accent bg-accent-glow text-xs text-text-primary shadow-[0_0_10px_rgba(108,99,255,0.18)]">
        ◈
      </div>
      <div className="flex max-w-[72%] flex-col gap-2">
        <div className="prose prose-invert max-w-none prose-p:my-0 prose-headings:my-0 prose-strong:text-text-primary prose-a:text-accent-primary text-sm leading-7 text-text-primary">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        {message.sources?.length ? (
          <div className="flex flex-wrap gap-2">
            {message.sources.map((source) => (
              <SourceChip
                key={source}
                source={source}
                label={documentMap?.get(source) || `${source.slice(0, 8)}...`}
              />
            ))}
          </div>
        ) : null}
        {typeof message.latency === 'number' ? (
          <div className="text-[11px] font-mono text-text-muted">Retrieved in {message.latency.toFixed(1)}s</div>
        ) : null}
        <div className="flex items-center gap-2 text-text-muted">
          <button type="button" className="rounded-md p-1 hover:bg-bg-overlay hover:text-text-primary" title="Copy">
            <Copy size={14} />
          </button>
          <button type="button" className="rounded-md p-1 hover:bg-bg-overlay hover:text-text-primary" title="Helpful">
            <ThumbsUp size={14} />
          </button>
          <button type="button" className="rounded-md p-1 hover:bg-bg-overlay hover:text-text-primary" title="Not helpful">
            <ThumbsDown size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
