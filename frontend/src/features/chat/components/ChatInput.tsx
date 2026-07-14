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
      className="space-y-2 max-w-4xl mx-auto w-full"
    >
      <div className={`flex items-end gap-3 rounded-[28px] bg-[#0f172a]/90 px-4 py-3 transition-all duration-300 focus-within:ring-[3px] focus-within:ring-accent-primary/40 shadow-xl border border-white/10 backdrop-blur-xl ${isSending ? 'ring-[3px] ring-accent-primary/40 opacity-80' : ''}`}>
        <button type="button" className="rounded-full p-2.5 text-[#64748b] transition-colors duration-200 hover:bg-white/10 hover:text-white active:scale-95" title="Attach file" disabled={isSending}>
          <Paperclip size={20} />
        </button>
        <textarea
          ref={textareaRef}
          className="max-h-[200px] min-h-[28px] flex-1 resize-none bg-transparent py-2 text-[15px] leading-relaxed text-white outline-none placeholder:text-[#64748b] transition-colors duration-200 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full"
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
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${value.trim() && !isSending ? 'bg-white text-accent-primary shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95' : 'bg-white/5 text-[#64748b]'}`}
        >
          {isSending ? <Loader2 size={20} className="animate-spin" /> : <ArrowUp size={20} strokeWidth={2.5} />}
        </button>
      </div>
      <div className="text-center text-[11px] text-text-muted transition-opacity duration-300">
        Press <kbd className="rounded border border-border-default bg-bg-overlay px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">Enter</kbd> to send ·{' '}
        <kbd className="rounded border border-border-default bg-bg-overlay px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">Shift+Enter</kbd> for new line
      </div>
    </motion.form>
  )
}
