export default function SourcesPanel({ sources }: { sources?: string[] }) {
  if (!sources || sources.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2">
      {sources.map((s) => (
        <span key={s} title={s} className="max-w-[220px] truncate rounded-full border border-border-default bg-bg-overlay px-2.5 py-1 text-[11px] text-text-secondary">
          {s}
        </span>
      ))}
    </div>
  )
}