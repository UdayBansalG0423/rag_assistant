import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { useChat } from "../hooks/useChat";
import { useSendMessage } from "../hooks/useSendMessage";
import MessageBubble from "./MessageBubble";
import EmptyState from "./EmptyState";
import { useMessages } from "../hooks/useMessages";
import { getDocuments } from '@/lib/api'

export default function ChatThread() {
  const { id } = useParams()
  const { messages, sessionId } = useChat(id ?? null)
  const { retryLastFailedTurn } = useSendMessage()
  useMessages(id)
  const scrollContainerRef = useRef<HTMLElement | null>(null)
  const stickToBottomRef = useRef(true)
  const hasInitializedSessionRef = useRef(false)
  const lastMessageSignatureRef = useRef<string | null>(null)

  const { data: documentsData } = useQuery({
    queryKey: ['documents'],
    queryFn: getDocuments,
    staleTime: 5 * 60 * 1000,
  })

  const documentMap = useMemo(() => {
    const documents = documentsData?.documents ?? []
    return new Map(
      documents.map((document) => [
        document.id,
        document.file_name || document.filename || document.name || document.storage_path,
      ]),
    )
  }, [documentsData])

  const groupedMessages = useMemo(() => {
    return messages.reduce<Array<typeof messages>>((groups, message) => {
      const lastGroup = groups[groups.length - 1]

      if (!lastGroup || message.role === 'user') {
        groups.push([message])
        return groups
      }

      lastGroup.push(message)
      return groups
    }, [])
  }, [messages])

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const container = scrollContainerRef.current
    if (!container) return

    container.scrollTo({ top: container.scrollHeight, behavior })
  }

  const getLastMessageSignature = () => {
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage) return null

    return [
      lastMessage.id,
      lastMessage.role,
      lastMessage.status ?? 'sent',
      lastMessage.content,
      lastMessage.sources?.join('|') ?? '',
      lastMessage.latency ?? '',
    ].join('::')
  }

  useEffect(() => {
    stickToBottomRef.current = true
    hasInitializedSessionRef.current = false
    lastMessageSignatureRef.current = null
    scrollToBottom('auto')
  }, [sessionId])

  useLayoutEffect(() => {
    if (!sessionId) return

    const lastMessageSignature = getLastMessageSignature()

    if (!hasInitializedSessionRef.current) {
      hasInitializedSessionRef.current = true
      lastMessageSignatureRef.current = lastMessageSignature
      scrollToBottom('auto')
      return
    }

    const lastMessageChanged = lastMessageSignatureRef.current !== lastMessageSignature
    lastMessageSignatureRef.current = lastMessageSignature

    if (lastMessageChanged && stickToBottomRef.current) {
      requestAnimationFrame(() => scrollToBottom('smooth'))
    }
  }, [messages, sessionId])

  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    stickToBottomRef.current = distanceFromBottom < 140
  }

  if (!sessionId) return <EmptyState />

  return (
    <main ref={scrollContainerRef} onScroll={handleScroll} className="relative h-full min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-28 sm:px-6">
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
          {groupedMessages.map((group, groupIndex) => (
            <section key={`${group[0]?.id ?? 'group'}-${groupIndex}`} className="flex flex-col gap-1.5">
              {group.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  documentMap={documentMap}
                  onRetry={message.status === 'error' ? retryLastFailedTurn : undefined}
                />
              ))}
            </section>
          ))}
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-bg-base to-transparent" />
    </main>
  )
}
