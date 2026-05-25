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
      const res = await getChatHistory(sessionId)
      return res.messages ?? []
    },
    enabled: !!sessionId,
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
