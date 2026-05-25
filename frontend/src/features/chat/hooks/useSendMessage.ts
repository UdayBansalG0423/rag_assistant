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
  const removeMessage = useChatStore((s) => s.removeMessage)
  const setActiveSession = useChatStore((s) => s.setActiveSession)
  const sessionId = useChatStore((s) => s.activeSessionId)
  const setSendStatus = useChatStore((s) => s.setSendStatus)
  const qc = useQueryClient()
  const navigate = useNavigate()

  const send = useCallback(
    async (content: string) => {
      setSendStatus('sending')

      let currentSessionId = sessionId
      let pendingMessageId: string | null = null
      try {
        if (!currentSessionId) {
          const session = await createChatSession()
          currentSessionId = session.id
          setActiveSession(currentSessionId)
          navigate(`/workspace/${currentSessionId}`, { replace: true })
        }

        const userMsg = createOptimisticUserMessage(content)
        addMessage(userMsg, currentSessionId)

        const pending = createPendingAssistantMessage()
        pendingMessageId = pending.id
        addMessage(pending, currentSessionId)

        const raw = await askQuery(content)

        updateMessage(pending.id, {
          content: raw.answer,
          sources: raw.sources,
          latency: raw.latency,
          status: 'sent',
        }, currentSessionId)

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
        if (pendingMessageId && currentSessionId) {
          updateMessage(pendingMessageId, { status: 'error', content: handleError(err) }, currentSessionId)
        }
      } finally {
        setSendStatus('idle')
      }
    },
    [addMessage, updateMessage, sessionId, setActiveSession, navigate, qc, setSendStatus],
  )

  const retryLastFailedTurn = useCallback(() => {
    const currentSessionId = useChatStore.getState().activeSessionId
    if (!currentSessionId) return

    const messages = useChatStore.getState().messages[currentSessionId] ?? []
    const lastMessage = messages[messages.length - 1]
    const priorMessage = messages[messages.length - 2]

    if (!lastMessage || lastMessage.status !== 'error' || lastMessage.role !== 'assistant') return
    if (!priorMessage || priorMessage.role !== 'user') return

    removeMessage(lastMessage.id, currentSessionId)
    removeMessage(priorMessage.id, currentSessionId)
    void send(priorMessage.content)
  }, [removeMessage, send])

  return { send, retryLastFailedTurn }
}
