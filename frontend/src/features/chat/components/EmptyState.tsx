import { FileText, Hash, CheckSquare, GitCompare } from 'lucide-react'
import { motion } from 'framer-motion'

const suggestions = [
  { label: 'Summarize my documents', query: 'Give me a summary of all my documents', Icon: FileText },
  { label: 'Key topics', query: 'What are the key topics in my documents?', Icon: Hash },
  { label: 'Find action items', query: 'Extract all action items from my documents', Icon: CheckSquare },
  { label: 'Compare documents', query: 'Compare the main points across my documents', Icon: GitCompare },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 25 } }
}

export default function EmptyState({ onSuggest }: { onSuggest?: (query: string) => void }) {
  return (
    <motion.div 
      initial="hidden" 
      animate="show" 
      variants={containerVariants}
      className="flex h-full flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center"
    >
      <motion.div variants={itemVariants} className="flex h-14 w-14 items-center justify-center rounded-full border border-border-accent bg-accent-glow text-2xl text-text-primary shadow-glow transition duration-500 hover:scale-110">
        ◈
      </motion.div>
      <motion.h2 variants={itemVariants} className="font-display text-2xl font-bold text-text-primary tracking-tight">What can I help you find?</motion.h2>
      <motion.p variants={itemVariants} className="max-w-lg text-sm leading-6 text-text-secondary">
        Ask anything about your uploaded documents. I&apos;ll retrieve the answer with citations.
      </motion.p>
      <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-2 pt-2">
        {suggestions.map(({ label, query, Icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => onSuggest?.(query)}
            className="inline-flex items-center gap-2 rounded-full border border-border-default bg-bg-elevated px-4 py-2 text-sm text-text-secondary transition-all duration-300 hover:-translate-y-1 hover:border-border-accent hover:bg-bg-overlay hover:text-text-primary hover:shadow-glow"
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </motion.div>
    </motion.div>
  )
}
