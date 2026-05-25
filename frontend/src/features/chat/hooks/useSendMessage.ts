import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useChatStore } from '../store/useChatStore'
import { adaptBackendMessage, createOptimisticUserMessage, createPendingAssistantMessage } from '../adapters/chat.adapter'
import { handleError } from '../../../shared/lib/error-handler'
import { askQuery, createChatSession, saveChatMessage } from '@/lib/api'

export function useSendMessage() {
  const addMessage = useChatStore((s) => s.appendMessage)
  const updateMessage = useChatStore((s) => s.updateMessage)
  const setMessages = useChatStore((s) => s.setMessages)
  const setActiveSession = useChatStore((s) => s.setActiveSession)
  const sessionId = useChatStore((s) => s.activeSessionId)
  const setSendStatus = useChatStore((s) => s.setSendStatus)
  const qc = useQueryClient()
  const navigate = useNavigate()

  const send = useCallback(
    async (content: string) => {
      setSendStatus('sending')

      let currentSessionId = sessionId
      if (!currentSessionId) {
        const session = await createChatSession()
        currentSessionId = session.id
        setActiveSession(currentSessionId)
      }

      const userMsg = createOptimisticUserMessage(content)
      addMessage(userMsg)

      const pending = createPendingAssistantMessage()
      addMessage(pending)

      if (currentSessionId && currentSessionId !== sessionId) {
        navigate(`/workspace/${currentSessionId}`, { replace: true })
      }

      try {
        const raw = await askQuery(content)

        updateMessage(pending.id, {
          content: raw.answer,
          sources: raw.sources,
          latency: raw.latency,
          status: 'sent',
        })

        const savedTurn = await saveChatMessage({
          session_id: currentSessionId!,
          user_query: content,
          assistant_response: raw.answer,
          sources: raw.sources,
          latency: raw.latency,
          title: content.slice(0, 60),
        })

        const state = useChatStore.getState()
        const currentMessages = state.messages[currentSessionId!] ?? []
        const stableMessages = currentMessages.filter(
          (message) => !message.id.startsWith('user-') && !message.id.startsWith('assistant-pending-')
        )

        const createdAt = new Date().toISOString()
        const persistedUser = adaptBackendMessage({
          id: `${savedTurn.id}-user`,
          role: 'user',
          content,
          sources: [],
          latency: null,
          timestamp: createdAt,
          status: 'sent',
        })
        const persistedAssistant = adaptBackendMessage({
          id: `${savedTurn.id}-assistant`,
          role: 'assistant',
          content: raw.answer,
          sources: raw.sources,
          latency: raw.latency,
          timestamp: createdAt,
          status: 'sent',
        })

        setMessages(currentSessionId!, [...stableMessages, persistedUser, persistedAssistant])

        qc.invalidateQueries({ queryKey: ['sessions'] })
      } catch (err) {
        updateMessage(pending.id, { status: 'error', content: handleError(err) })
      } finally {
        setSendStatus('idle')
      }
    },
    [addMessage, updateMessage, sessionId, setActiveSession, navigate, qc, setSendStatus],
  )

  return { send }
}
