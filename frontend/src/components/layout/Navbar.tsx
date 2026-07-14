import { Menu, Upload, User, Settings } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Logo } from '@/components/Logo'

interface NavbarProps {
  onToggleDocumentModal: () => void
}

export function Navbar({ onToggleDocumentModal }: NavbarProps) {
  const { toggleSidebar } = useAppStore()
  const navigate = useNavigate()
  const { user } = useAuth()

  const initials = (user?.name || user?.email || 'U')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <nav className="h-14 bg-bg-surface flex items-center justify-between px-4 shrink-0 relative z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-bg-overlay text-text-secondary hover:text-text-primary transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2.5">
          <Logo className="h-7 w-7 shrink-0 text-accent-primary drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
          <span className="text-xl font-display font-bold tracking-wide text-white">NeuralDoc</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleDocumentModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 transition-colors"
        >
          <Upload size={16} />
          <span className="text-sm font-medium">Document Vault</span>
        </button>
        
        <div className="w-px h-6 bg-border-subtle mx-1"></div>
        
        <button 
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 p-1 rounded-full hover:bg-bg-overlay transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center border border-accent-primary/30 group-hover:border-accent-primary/50 transition-colors">
            <span className="text-xs font-semibold text-accent-primary">{initials}</span>
          </div>
        </button>
      </div>
    </nav>
  )
}
