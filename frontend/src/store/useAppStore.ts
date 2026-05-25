import { create } from 'zustand'

interface AppState {
  sidebarOpen: boolean
  currentChat: string | null
  showDocumentModal: boolean
  workspace: string
  
  toggleSidebar: () => void
  setCurrentChat: (id: string | null) => void
  toggleDocumentModal: () => void
  setWorkspace: (workspace: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  currentChat: null,
  showDocumentModal: false,
  workspace: 'Default Workspace',
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setCurrentChat: (id) => set({ currentChat: id }),
  toggleDocumentModal: () => set((state) => ({ showDocumentModal: !state.showDocumentModal })),
  setWorkspace: (workspace) => set({ workspace }),
}))
