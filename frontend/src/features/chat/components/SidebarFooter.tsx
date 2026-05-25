import { LogOut, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export default function SidebarFooter() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const initials = (user?.name || user?.email || 'U')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex items-center justify-between gap-2 border-t border-border-subtle px-4 py-3">
      <button
        type="button"
        onClick={() => navigate('/settings/profile')}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-bg-overlay"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-default bg-accent-primary/20 text-xs font-semibold text-accent-primary">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-text-primary">{user?.name || 'User'}</div>
          <div className="truncate text-xs text-text-muted">{user?.email || ''}</div>
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="rounded-md p-1.5 text-text-secondary transition hover:bg-bg-overlay hover:text-text-primary"
          title="Settings"
        >
          <Settings size={16} />
        </button>
        <button
          type="button"
          onClick={() => void signOut()}
          className="rounded-md p-1.5 text-text-secondary transition hover:bg-bg-overlay hover:text-text-primary"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  )
}