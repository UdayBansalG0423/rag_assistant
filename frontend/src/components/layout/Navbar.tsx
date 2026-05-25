import { Menu, Sun, Upload, Bell, User, ChevronDown } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

interface NavbarProps {
  onToggleDocumentModal: () => void
}

export function Navbar({ onToggleDocumentModal }: NavbarProps) {
  const { toggleSidebar } = useAppStore()

  return (
    <nav className="h-12 bg-bg-surface border-b border-border-subtle flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-bg-overlay text-text-secondary hover:text-text-primary transition-colors"
        >
          <Menu size={18} />
        </button>
        
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-bg-overlay cursor-pointer transition-colors">
          <span className="text-sm font-semibold text-text-primary">NeuralDoc</span>
          <ChevronDown size={14} className="text-text-muted" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg hover:bg-bg-overlay text-text-secondary hover:text-text-primary transition-colors">
          <Sun size={18} />
        </button>
        
        <button 
          onClick={onToggleDocumentModal}
          className="p-2 rounded-lg hover:bg-bg-overlay text-text-secondary hover:text-text-primary transition-colors"
        >
          <Upload size={18} />
        </button>
        
        <button className="p-2 rounded-lg hover:bg-bg-overlay text-text-secondary hover:text-text-primary transition-colors">
          <Bell size={18} />
        </button>
        
        <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-bg-overlay transition-colors">
          <div className="w-7 h-7 rounded-full bg-accent-primary/20 flex items-center justify-center">
            <User size={14} className="text-accent-primary" />
          </div>
        </button>
      </div>
    </nav>
  )
}
