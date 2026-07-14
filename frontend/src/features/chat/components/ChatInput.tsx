import React, { useEffect, useRef, useState } from 'react'
import { ArrowUp, Loader2, Paperclip } from 'lucide-react'
import { useSendMessage } from '../hooks/useSendMessage'
import { useChatStore } from '../store/useChatStore'
import { motion } from 'framer-motion'

export default function ChatInput() {
  const [value, setValue] = useState('')
  const { send } = useSendMessage()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isSending = useChatStore((s) => s.sendStatus === 'sending')

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!value.trim() || isSending) return
    try {
      await send(value.trim())
      setValue('')
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`
  }, [value])

  return (
    <motion.form 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 400, damping: 25 }}
      onSubmit={submit} 
      className="space-y-2"
    >
      <div className={`flex items-end gap-2 rounded-2xl border border-border-default bg-bg-elevated px-3 py-2 transition-all duration-300 focus-within:border-accent-primary focus-within:shadow-glow focus-within:ring-2 focus-within:ring-accent-primary/20 ${isSending ? 'border-accent-primary shadow-glow opacity-80' : ''}`}>
        <button type="button" className="rounded-md p-2 text-text-muted transition-colors duration-200 hover:bg-bg-overlay hover:text-text-primary active:scale-95" title="Attach file" disabled={isSending}>
          <Paperclip size={16} />
        </button>
        <textarea
          ref={textareaRef}
          className="max-h-40 min-h-[24px] flex-1 resize-none bg-transparent py-1 text-sm leading-6 text-text-primary outline-none placeholder:text-text-muted transition-colors duration-200"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          rows={1}
          placeholder="Ask NeuralDoc..."
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={!value.trim() || isSending}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${value.trim() && !isSending ? 'bg-accent-primary text-white shadow-glow hover:scale-105 active:scale-95' : 'bg-bg-overlay text-text-muted'}`}
        >
          {isSending ? <Loader2 size={16} className="animate-spin" /> : <ArrowUp size={16} />}
        </button>
      </div>
      <div className="text-center text-[11px] text-text-muted transition-opacity duration-300">
        Press <kbd className="rounded border border-border-default bg-bg-overlay px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">Enter</kbd> to send ·{' '}
        <kbd className="rounded border border-border-default bg-bg-overlay px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">Shift+Enter</kbd> for new line
      </div>
    </motion.form>
  )
}
