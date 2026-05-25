import { MoreHorizontal, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { formatRelativeTime } from '../adapters/chat.adapter'
import type { ChatSession } from '../types/chat.types'

export default function SessionItem({
  session,
  isActive,
  onClick,
  onDelete,
}: {
  session: ChatSession
  isActive: boolean
  onClick: () => void
  onDelete: () => void
}) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onClick()
      }}
      className={`group relative flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 transition ${isActive ? 'border-l-2 border-accent-primary bg-bg-elevated pl-[10px] text-text-primary' : 'text-text-secondary hover:bg-bg-overlay hover:text-text-primary'}`}
    >
      <MessageSquare size={14} className="shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{session.title || 'New Chat'}</div>
        <div className="text-xs text-text-muted">{formatRelativeTime(session.updated_at || session.created_at)}</div>
      </div>
      <button
        type="button"
        className={`shrink-0 rounded-md p-1 transition hover:bg-bg-overlay ${showMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        onClick={(event) => {
          event.stopPropagation()
          setShowMenu((value) => !value)
        }}
        aria-label="Session menu"
      >
        <MoreHorizontal size={14} />
      </button>
      {showMenu ? (
        <div className="absolute right-2 top-10 z-20 w-32 overflow-hidden rounded-xl border border-border-default bg-bg-surface shadow-card">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              setShowMenu(false)
              onDelete()
            }}
            className="w-full px-3 py-2 text-left text-sm text-status-error transition hover:bg-bg-overlay"
          >
            Delete chat
          </button>
        </div>
      ) : null}
    </div>
  )
}