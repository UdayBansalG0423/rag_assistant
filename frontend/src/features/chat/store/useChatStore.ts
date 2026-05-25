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
  appendMessage: (message: ChatMessage, sessionId?: string | null) => void
  updateMessage: (id: string, patch: Partial<ChatMessage>, sessionId?: string | null) => void
  removeMessage: (id: string, sessionId?: string | null) => void
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
  appendMessage: (message, sessionId) => {
    const { activeSessionId, messages } = get()
    const targetSessionId = sessionId ?? activeSessionId
    if (!targetSessionId) return
    const existing = messages[targetSessionId] ?? []
    set({ messages: { ...messages, [targetSessionId]: [...existing, message] } })
  },
  updateMessage: (id, patch, sessionId) => {
    const { activeSessionId, messages } = get()
    const targetSessionId = sessionId ?? activeSessionId
    if (!targetSessionId) return
    const updated = (messages[targetSessionId] ?? []).map((message) =>
      message.id === id ? { ...message, ...patch } : message,
    )
    set({ messages: { ...messages, [targetSessionId]: updated } })
  },
  removeMessage: (id, sessionId) => {
    const { activeSessionId, messages } = get()
    const targetSessionId = sessionId ?? activeSessionId
    if (!targetSessionId) return
    const updated = (messages[targetSessionId] ?? []).filter((message) => message.id !== id)
    set({ messages: { ...messages, [targetSessionId]: updated } })
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
