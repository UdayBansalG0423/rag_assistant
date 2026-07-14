import { Logo } from '@/components/Logo'
import { Copy, ThumbsDown, ThumbsUp, AlertCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { memo } from 'react'
import type { ChatMessage } from '../types/chat.types'
import SourcesPanel from './SourcesPanel'

function PendingBubble() {
  return (
    <div className="flex items-start gap-3 px-4 py-1.5 sm:px-5">
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-primary/20 text-accent-primary shadow-[0_0_15px_rgba(59,130,246,0.15)]">
        <Logo className="h-5 w-5" />
      </div>
      <div className="flex w-fit items-center gap-2 rounded-2xl border border-border-default bg-bg-elevated px-4 py-3 shadow-sm">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-muted" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-muted [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-muted [animation-delay:300ms]" />
        <span className="pl-1 text-[11px] font-mono text-text-muted">waiting</span>
      </div>
    </div>
  )
}

function MessageBubble({
  message,
  documentMap,
  onRetry,
}: {
  message: ChatMessage
  documentMap?: Map<string, string>
  onRetry?: () => void
}) {

  const markdownComponents = {
    p: ({ children }: { children?: React.ReactNode }) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
    ul: ({ children }: { children?: React.ReactNode }) => <ul className="mb-4 list-disc space-y-2 pl-5 last:mb-0">{children}</ul>,
    ol: ({ children }: { children?: React.ReactNode }) => <ol className="mb-4 list-decimal space-y-2 pl-5 last:mb-0">{children}</ol>,
    li: ({ children }: { children?: React.ReactNode }) => <li className="leading-relaxed">{children}</li>,
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="mb-4 border-l-2 border-border-default pl-4 text-text-secondary italic last:mb-0">{children}</blockquote>
    ),
    h1: ({ children }: { children?: React.ReactNode }) => <h1 className="mb-4 mt-6 text-xl font-semibold text-text-primary">{children}</h1>,
    h2: ({ children }: { children?: React.ReactNode }) => <h2 className="mb-3 mt-5 text-lg font-semibold text-text-primary">{children}</h2>,
    h3: ({ children }: { children?: React.ReactNode }) => <h3 className="mb-3 mt-4 text-base font-semibold text-text-primary">{children}</h3>,
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
      <a href={href} target="_blank" rel="noreferrer" className="text-accent-primary underline decoration-accent-primary/30 underline-offset-2 hover:decoration-accent-primary transition-colors">
        {children}
      </a>
    ),
    code: ({ inline, children }: { inline?: boolean; children?: React.ReactNode }) =>
      inline ? (
        <code className="rounded bg-bg-overlay px-1.5 py-0.5 font-mono text-[0.92em] text-accent-secondary">{children}</code>
      ) : (
        <code className="block overflow-x-auto rounded-xl border border-border-default bg-bg-surface px-4 py-3 mb-4 last:mb-0 font-mono text-[13px] leading-6 text-text-primary">{children}</code>
      ),
  }

  if (message.role === 'user') {
    return (
      <div className="flex justify-end px-4 py-1.5 sm:px-5">
        <div className="max-w-[78%] rounded-[20px_20px_4px_20px] bg-accent-primary px-5 py-3.5 text-[15px] leading-relaxed text-white shadow-md font-medium">
          {message.content}
        </div>
      </div>
    )
  }

  if (message.status === 'pending') {
    return <PendingBubble />
  }

  if (message.status === 'error') {
    return (
      <div className="flex items-start gap-3 px-4 py-1.5 sm:px-5">
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-status-error/20 text-status-error shadow-[0_0_15px_rgba(239,68,68,0.15)]">
          <AlertCircle size={16} />
        </div>
        <div className="flex max-w-[72%] items-center gap-3 rounded-xl border border-status-error/25 bg-status-error/10 px-3 py-2 text-sm text-status-error shadow-sm">
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
    <div className="flex items-start gap-4 px-4 py-3 sm:px-5">
      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1e293b] border border-white/5 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
        <Logo className="h-5 w-5 text-accent-primary" />
      </div>
      <div className="flex max-w-[85%] flex-col gap-3 rounded-2xl bg-[#0f172a]/80 px-6 py-5 shadow-lg backdrop-blur-md border border-white/5">
        <div className="prose prose-invert max-w-none prose-p:my-0 prose-headings:my-0 prose-strong:text-text-primary prose-a:text-accent-primary prose-pre:my-2 prose-pre:overflow-x-auto text-[15px] leading-relaxed text-text-primary">
          <ReactMarkdown components={markdownComponents}>{message.content}</ReactMarkdown>
        </div>
        <SourcesPanel sources={message.sources?.map((source) => documentMap?.get(source) || `${source.slice(0, 8)}...`)} />
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

export default memo(MessageBubble)
