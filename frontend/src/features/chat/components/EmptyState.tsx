import { FileText, Hash, CheckSquare, GitCompare } from 'lucide-react'

const suggestions = [
  { label: 'Summarize my documents', query: 'Give me a summary of all my documents', Icon: FileText },
  { label: 'Key topics', query: 'What are the key topics in my documents?', Icon: Hash },
  { label: 'Find action items', query: 'Extract all action items from my documents', Icon: CheckSquare },
  { label: 'Compare documents', query: 'Compare the main points across my documents', Icon: GitCompare },
]

export default function EmptyState({ onSuggest }: { onSuggest?: (query: string) => void }) {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border-accent bg-accent-glow text-2xl text-text-primary">
        ◈
      </div>
      <h2 className="font-display text-2xl font-bold text-text-primary">What can I help you find?</h2>
      <p className="max-w-lg text-sm leading-6 text-text-secondary">
        Ask anything about your uploaded documents. I&apos;ll retrieve the answer with citations.
      </p>
      <div className="flex flex-wrap justify-center gap-2 pt-2">
        {suggestions.map(({ label, query, Icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => onSuggest?.(query)}
            className="inline-flex items-center gap-2 rounded-full border border-border-default bg-bg-elevated px-4 py-2 text-sm text-text-secondary transition hover:-translate-y-0.5 hover:border-border-accent hover:bg-bg-overlay hover:text-text-primary"
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
