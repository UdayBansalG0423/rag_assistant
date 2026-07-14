import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export default function SidebarFooter() {
  const { signOut } = useAuth()

  return (
    <div className="flex items-center px-6 py-6 border-t border-white/[0.02]">
      <button
        type="button"
        onClick={() => void signOut()}
        className="flex items-center gap-3 text-[#94a3b8] hover:text-white transition-colors"
      >
        <LogOut size={20} strokeWidth={1.5} />
        <span className="text-[15px] font-medium tracking-wide">Logout</span>
      </button>
    </div>
  )
}