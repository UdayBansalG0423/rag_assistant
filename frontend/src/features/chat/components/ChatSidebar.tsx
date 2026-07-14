import { Plus, RefreshCw } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSessions } from '../hooks/useSessions'
import { useChatStore } from '../store/useChatStore'
import SessionItem from './SessionItem'


export default function ChatSidebar() {
  const { sessionsQuery, createMutation, deleteMutation } = useSessions()
  const clearMessages = useChatStore((s) => s.clearMessages)
  const { id: routeSessionId } = useParams()
  const navigate = useNavigate()

  const sessions = (sessionsQuery.data ?? []) as any[]

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-sm font-medium text-text-primary">Default Workspace</span>
        <button
          onClick={() => sessionsQuery.refetch()}
          className="rounded-md p-1.5 text-text-secondary transition hover:bg-bg-overlay hover:text-text-primary"
          aria-label="Refresh sessions"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          void createMutation.mutateAsync().then((session) => {
            navigate(`/workspace/${session.id}`)
          })
        }}
        className="mx-4 mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-border-default bg-bg-elevated px-3 py-2 text-sm font-medium text-text-primary transition hover:border-border-accent hover:bg-bg-overlay"
      >
        <Plus size={15} />
        New Chat
      </button>

      <div className="px-4 pb-2 pt-4 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
        Conversations
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-3">
        {sessions.map((s: any) => {
          const active = s.id === routeSessionId
          return (
            <SessionItem
              key={s.id}
              session={s}
              isActive={active}
              onClick={() => {
                navigate(`/workspace/${s.id}`)
              }}
              onDelete={() => {
                const shouldResetWorkspace = routeSessionId === s.id
                void deleteMutation.mutateAsync(s.id).then(() => {
                  clearMessages(s.id)
                  if (shouldResetWorkspace) {
                    navigate('/workspace', { replace: true })
                  }
                })
              }}
            >
            </SessionItem>
          )
        })}
      </div>
    </div>
  )
}
