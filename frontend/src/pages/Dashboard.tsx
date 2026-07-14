import { useEffect } from 'react'
import { Navbar } from '@/components/layout'
import { Sidebar } from '@/components/layout'
import { DocumentManager } from '@/components/modals'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/hooks/use-auth'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { useChatStore } from '@/features/chat'
import { ChatThread, ChatInput } from '@/features/chat'

export default function Dashboard() {
  const { showDocumentModal, toggleDocumentModal } = useAppStore()
  const { isLoading, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { sidebarOpen } = useAppStore()
  const { id } = useParams()
  const setActiveSession = useChatStore((s) => s.setActiveSession)

  useEffect(() => {
    setActiveSession(id ?? null)
  }, [id, setActiveSession])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-base text-text-muted">
        Loading...
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen flex flex-col bg-bg-base">
          <Navbar onToggleDocumentModal={toggleDocumentModal} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Welcome to NeuralDoc</h2>
              <p className="text-text-secondary mb-6">You are not signed in. Please sign in to access your workspace.</p>
              <div className="flex items-center justify-center gap-4">
                <button onClick={() => navigate('/login')} className="px-4 py-2 rounded bg-accent-primary text-white">Sign in</button>
                <button onClick={() => navigate('/signup')} className="px-4 py-2 rounded border border-border-subtle">Create account</button>
              </div>
            </div>
          </div>
        </div>
        <div className="fixed bottom-4 right-4 p-2 bg-bg-surface border border-border-subtle text-xs text-text-muted rounded">
          <div>isLoading: {String(isLoading)}</div>
          <div>isAuthenticated: {String(isAuthenticated)}</div>
          <div>sidebarOpen: {String(sidebarOpen)}</div>
        </div>
      </>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-bg-base">
      <Navbar onToggleDocumentModal={toggleDocumentModal} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 min-h-0 flex-col">
          <div className="flex-1 min-h-0 overflow-hidden relative">
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg-base to-transparent pointer-events-none z-10" />
            <ChatThread />
          </div>
          <div className="p-4 pt-0 relative z-20 pb-8">
            <div className="max-w-3xl mx-auto">
              <ChatInput />
            </div>
          </div>
        </div>
      </div>

      <DocumentManager 
        isOpen={showDocumentModal} 
        onClose={toggleDocumentModal} 
      />
    </div>
  )
}
