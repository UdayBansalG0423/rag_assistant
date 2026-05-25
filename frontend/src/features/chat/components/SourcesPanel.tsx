export default function SourcesPanel({ sources }: { sources?: string[] }) {
  if (!sources || sources.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2">
      {sources.map((s) => (
        <div key={s} className="rounded-full border border-border-default bg-bg-overlay px-2.5 py-1 text-[11px] text-text-secondary">
          {s}
        </div>
      ))}
    </div>
  )
}