import { create } from 'zustand'
import type { ChatMessage, ChatSession } from '../types/chat.types'

type ChatState = {
  sessions: ChatSession[]
  activeSessionId: string | null
  messages: Record<string, ChatMessage[]>
  sendStatus: 'idle' | 'sending' | 'error'
  setSessions: (sessions: ChatSession[]) => void
  setActiveSession: (id: string | null) => void
  setMessages: (sessionId: string, messages: ChatMessage[]) => void
  appendMessage: (message: ChatMessage) => void
  updateMessage: (id: string, patch: Partial<ChatMessage>) => void
  clearMessages: (sessionId?: string) => void
  setSendStatus: (status: ChatState['sendStatus']) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  messages: {},
  sendStatus: 'idle',

  setSessions: (sessions) => set({ sessions }),
  setActiveSession: (id) => set({ activeSessionId: id }),
  setMessages: (sessionId, messages) =>
    set((state) => ({ messages: { ...state.messages, [sessionId]: messages } })),
  appendMessage: (message) => {
    const { activeSessionId, messages } = get()
    if (!activeSessionId) return
    const existing = messages[activeSessionId] ?? []
    set({ messages: { ...messages, [activeSessionId]: [...existing, message] } })
  },
  updateMessage: (id, patch) => {
    const { activeSessionId, messages } = get()
    if (!activeSessionId) return
    const updated = (messages[activeSessionId] ?? []).map((message) =>
      message.id === id ? { ...message, ...patch } : message,
    )
    set({ messages: { ...messages, [activeSessionId]: updated } })
  },
  clearMessages: (sessionId) =>
    set((state) => {
      if (!sessionId) return { messages: {} }
      const next = { ...state.messages }
      delete next[sessionId]
      return { messages: next }
    }),
  setSendStatus: (status) => set({ sendStatus: status }),
}))
