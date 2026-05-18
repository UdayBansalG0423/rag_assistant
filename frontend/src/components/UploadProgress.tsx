import React, { useEffect, useState } from 'react'
import { getStoredToken } from '@/lib/auth'

type Status = {
  last_index?: number
  last_processed_chunk?: number
  total?: number
  progress?: number
  status?: string
  error?: string
}

const STATUS_LABELS: Record<string, string> = {
  extracting_pages: 'Extracting pages...',
  chunking: 'Chunking...',
  embedding: 'Embedding',
  indexing: 'Indexing...',
  done: 'Done.',
  failed: 'Failed.',
}

export default function UploadProgress({ documentId }: { documentId: string }) {
  const [status, setStatus] = useState<Status | null>(null)

  useEffect(() => {
    let mounted = true
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const storageKey = `rag_upload_status_${documentId}`

    const isTerminalStatus = (value?: string) =>
      value === 'done' || value === 'failed' || value === 'error' || value === 'not_found'

    const getCachedTerminalStatus = (): Status | null => {
      try {
        if (typeof window === 'undefined') return null
        const raw = window.localStorage.getItem(storageKey)
        if (!raw) return null
        const parsed = JSON.parse(raw) as Status
        return isTerminalStatus(parsed.status) ? parsed : null
      } catch {
        return null
      }
    }

    const cacheTerminalStatus = (value: Status) => {
      try {
        if (typeof window === 'undefined') return
        window.localStorage.setItem(storageKey, JSON.stringify(value))
      } catch {
        // ignore storage failures
      }
    }

    const cached = getCachedTerminalStatus()
    if (cached) {
      setStatus(cached)
      return () => {
        mounted = false
      }
    }

    const fetchStatus = async () => {
      try {
        const token = getStoredToken()
        const res = await fetch(`/upload/status/${encodeURIComponent(documentId)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (!res.ok) {
          setStatus({ status: 'error', error: `HTTP ${res.status}` })
          return
        }
        const data = await res.json()
        if (!mounted) return

        setStatus(data)

        if (isTerminalStatus(data.status)) {
          cacheTerminalStatus(data)
        } else {
          timeoutId = setTimeout(fetchStatus, 1000)
        }
      } catch (e: any) {
        if (!mounted) return

        const errorStatus = { status: 'error', error: String(e) }
        setStatus(errorStatus)
        cacheTerminalStatus(errorStatus)
      }
    }

    fetchStatus()
    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [documentId])

  if (!status) return <div>Extracting pages...</div>

  if (status.status === 'not_found') return <div>No progress found for this document.</div>
  if (status.status === 'error') return <div>Error: {status.error}</div>

  const processed = status.last_index ?? (status.last_processed_chunk != null ? status.last_processed_chunk + 1 : 0)
  const pct = status.progress ?? (status.total ? Math.round((processed / status.total) * 100) : 0)
  const label = STATUS_LABELS[status.status || ''] || 'Indexing...'

  return (
    <div className="upload-progress">
      <div style={{ marginBottom: 8 }}>
        {status.status === 'embedding' ? `Embedding ${pct}%...` : label}
      </div>
      <div style={{ background: '#eee', height: 12, width: '100%', borderRadius: 6 }}>
        <div style={{ width: `${pct}%`, background: '#4caf50', height: '100%', borderRadius: 6 }} />
      </div>
      <div style={{ marginTop: 8 }}>{pct}% ({processed}/{status.total ?? 'unknown'})</div>
    </div>
  )
}
