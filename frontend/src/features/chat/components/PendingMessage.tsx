export default function PendingMessage() {
  return (
    <div className="flex items-start gap-3 px-6 py-2">
      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-accent bg-accent-glow text-xs text-text-primary">
        ◈
      </div>
      <div className="flex w-fit items-center gap-1 rounded-2xl bg-bg-elevated px-4 py-3">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-muted" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-muted [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-muted [animation-delay:300ms]" />
      </div>
    </div>
  )
}
