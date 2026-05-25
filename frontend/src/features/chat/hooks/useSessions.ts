import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createChatSession, deleteChatSession, getChatSessions, getChatHistory } from '@/lib/api'
import { useEffect } from 'react'
import { useChatStore } from '../store/useChatStore'

export function useSessions() {
  const qc = useQueryClient()
  const setSessions = useChatStore((s) => s.setSessions)

  const sessionsQuery = useQuery<any[], Error>({
    queryKey: ['sessions'],
    queryFn: async () => {
      const res = await getChatSessions()
      return res.sessions ?? []
    },
  })

  useEffect(() => {
    if (sessionsQuery.data) {
      setSessions(sessionsQuery.data as any)
    }
  }, [sessionsQuery.data, setSessions])

  const createMutation = useMutation({
    mutationFn: async (): Promise<any> => {
      const session = await createChatSession()
      return session
    },
    onSuccess: (_data: any) => {
      qc.invalidateQueries({ queryKey: ['sessions'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (sessionId: string) => deleteChatSession(sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  const getHistory = async (sessionId: string) => {
    const res = await getChatHistory(sessionId)
    return res.messages ?? []
  }

  return { sessionsQuery, createMutation, deleteMutation, getHistory }
}
