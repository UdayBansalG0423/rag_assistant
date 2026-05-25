import { useMemo } from 'react'
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

  if (!sessionId) return <EmptyState />

  return (
    <main className="relative flex-1 overflow-auto p-6 pb-24">
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            documentMap={documentMap}
            onRetry={m.status === 'error' ? retryLastFailedTurn : undefined}
          />
        ))
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-bg-base to-transparent" />
    </main>
  )
}
