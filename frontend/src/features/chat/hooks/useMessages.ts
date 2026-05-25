import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getChatHistory } from '@/lib/api'
import { useChatStore } from '../store/useChatStore'
import { adaptBackendMessage } from '../adapters/chat.adapter'

export function useMessages(sessionId?: string) {
  const setMessages = useChatStore((s) => s.setMessages)
  const existingMessages = useChatStore((s) => (sessionId ? s.messages[sessionId] ?? [] : []))

  const query = useQuery({
    queryKey: ['messages', sessionId],
    queryFn: async () => {
      if (!sessionId) return []
      try {
        const res = await getChatHistory(sessionId)
        return res.messages ?? []
      } catch (err) {
        const message = err instanceof Error ? err.message.toLowerCase() : ''
        if (message.includes('chat session not found') || message.includes('request failed (404)')) {
          return []
        }
        throw err
      }
    },
    enabled: !!sessionId,
    retry: false,
  })

  useEffect(() => {
    if (!sessionId) {
      return
    }

    if (!query.data) return

    const data = query.data as any[]
    const normalized = (data ?? []).map((m: any) => adaptBackendMessage(m))

    const hasPendingOptimisticMessage = existingMessages.some((message) => message.status === 'pending')
    if (hasPendingOptimisticMessage) return

    if (normalized.length === 0 && existingMessages.length > 0) return

    setMessages(sessionId, normalized as any)
  }, [sessionId, query.data, setMessages, existingMessages.length])
}
