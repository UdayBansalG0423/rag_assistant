import { useAppStore } from '@/store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatSidebar } from '@/features/chat'
import SidebarFooter from '@/features/chat/components/SidebarFooter'

export function Sidebar() {
  const { sidebarOpen } = useAppStore()

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 260, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.24, ease: 'easeInOut' }}
          className="h-full bg-bg-surface flex flex-col overflow-hidden shrink-0 relative z-20"
        >
          <div className="flex-1 overflow-hidden">
            <ChatSidebar />
          </div>

          <SidebarFooter />
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
