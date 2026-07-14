import { useRef, useState } from 'react'
import { Loader2, X, Search, Upload, FileText, Filter, ChevronDown, MoreHorizontal, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { useDocumentPolling } from '@/hooks/use-document-polling'
import { uploadPdf, retryDocument } from '@/services/document.service'
import UploadProgress from '@/components/UploadProgress'
import { DocumentStatusDisplay } from '@/components/DocumentStatusDisplay'

interface DocumentManagerProps {
  isOpen: boolean
  onClose: () => void
}

export function DocumentManager({ isOpen, onClose }: DocumentManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'documents' | 'indexing'>('documents')
  const [hoveredDoc, setHoveredDoc] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const { documents, loading, error, refresh, retry, hasProcessing, polling } = useDocumentPolling({
    enabled: isOpen,
    pollInterval: 2000,
    stopWhenComplete: false,
  })

  const filteredDocs = documents.filter((doc) => {
    const label = (doc.file_name || doc.filename || doc.name || doc.storage_path || '').toLowerCase()
    return label.includes(searchQuery.toLowerCase())
  })

  const visibleDocs = activeTab === 'indexing'
    ? filteredDocs.filter((doc) => doc.status === 'queued' || doc.status === 'processing')
    : filteredDocs

  const formatDate = (value?: string | null) => {
    if (!value) return 'Unknown'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Unknown'
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)
    try {
      const response = await uploadPdf(file)
      setActiveDocumentId(response.id)
      toast.success(`${response.filename || file.name} uploaded`)
      await refresh()
    } catch (error: any) {
      const message = error?.message || 'Upload failed'
      setUploadError(message)
      toast.error(message)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-[#0f172a] border border-white/5 rounded-[24px] shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">Document Vault</h2>
                  <p className="text-sm text-text-muted">Read-only mode — documents cannot be modified in chat</p>
                </div>
                <div className="flex items-center gap-2">
                  <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={handleUpload} />
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="btn-primary flex items-center gap-2 disabled:opacity-60"
                    disabled={uploading}
                  >
                    <Upload size={16} />
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-bg-overlay text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {uploadError && (
                <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {uploadError}
                </div>
              )}

              {error && (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  <span>{error}</span>
                  <button
                    type="button"
                    onClick={retry}
                    className="rounded-md border border-red-400/20 px-2 py-1 text-xs font-medium text-red-100 transition hover:bg-red-500/15"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => setActiveTab('documents')}
                  className={cn(
                    'pb-2 text-sm font-medium border-b-2 transition-colors',
                    activeTab === 'documents'
                      ? 'border-accent-primary text-accent-primary'
                      : 'border-transparent text-text-muted hover:text-text-secondary'
                  )}
                >
                  Documents
                </button>
                <button
                  onClick={() => setActiveTab('indexing')}
                  className={cn(
                    'pb-2 text-sm font-medium border-b-2 transition-colors',
                    activeTab === 'indexing'
                      ? 'border-accent-primary text-accent-primary'
                      : 'border-transparent text-text-muted hover:text-text-secondary'
                  )}
                >
                  Indexing Queue
                </button>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="px-6 py-2 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary focus:bg-white/[0.07] transition-all"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm text-text-secondary hover:bg-white/10 hover:text-white transition-colors">
                  <Filter size={14} />
                  Filter
                  <ChevronDown size={14} />
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm text-text-secondary hover:bg-white/10 hover:text-white transition-colors">
                  Sort
                  <ChevronDown size={14} />
                </button>
              </div>
              {polling ? (
                <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Polling document status...</span>
                </div>
              ) : null}
            </div>

            {/* Document List */}
            <div className="overflow-y-auto flex-1 min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
              <div className="grid grid-cols-12 gap-4 px-6 py-2 bg-black/20 text-[11px] font-semibold text-text-muted uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
                <div className="col-span-5">Name</div>
                <div className="col-span-2">Created</div>
                <div className="col-span-3">Status</div>
                <div className="col-span-2"></div>
              </div>

              {(loading ? [] : visibleDocs).map((doc) => (
                <div
                  key={doc.id}
                  className={cn(
                    'grid grid-cols-12 gap-4 px-6 py-3.5 items-center transition-colors border-b border-white/[0.02] hover:bg-white/[0.03]',
                    hoveredDoc === doc.id && 'bg-white/[0.03]'
                  )}
                  onMouseEnter={() => setHoveredDoc(doc.id)}
                  onMouseLeave={() => setHoveredDoc(null)}
                >
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <FileText size={16} className="text-text-muted shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-sm text-text-primary truncate font-mono">
                        {doc.file_name || doc.filename || doc.name || 'Untitled document'}
                      </span>
                      <span className="block text-xs text-text-muted truncate">{doc.storage_path}</span>
                    </div>
                  </div>
                  <div className="col-span-2 text-sm text-text-secondary">{formatDate(doc.created_at)}</div>
                  <div className="col-span-3">
                    <DocumentStatusDisplay
                      status={doc.status === 'completed' ? 'completed' : doc.status === 'failed' ? 'failed' : doc.status === 'queued' ? 'queued' : 'processing'}
                      progress={doc.progress}
                      error={doc.error}
                      onRetry={async () => {
                        try {
                          await retryDocument(doc.id)
                          toast.success('Document retry queued')
                          refresh()
                        } catch (error: any) {
                          toast.error(error.message || 'Retry failed')
                        }
                      }}
                    />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    {hoveredDoc === doc.id && (
                      <div className="flex items-center gap-1">
                        <button className="p-1 rounded hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors" title="View">
                          <Eye size={14} />
                        </button>
                        <button className="p-1 rounded hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors" title="More">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {!loading && visibleDocs.length === 0 && (
                <div className="px-6 py-10 text-center text-sm text-text-muted">
                  {error ? error : 'No documents found.'}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-black/20 flex items-center justify-between">
              <span className="text-sm text-text-muted">
                Showing {visibleDocs.length} of {documents.length} documents
              </span>
              {documents.length > 0 && hasProcessing && (
                <button className="text-sm text-accent-primary hover:underline" onClick={refresh}>
                  Refresh indexing
                </button>
              )}
            </div>

            {activeDocumentId && (
              <div className="px-6 pb-6">
                <UploadProgress
                  documentId={activeDocumentId}
                  onRetry={async () => {
                    try {
                      await retryDocument(activeDocumentId)
                      toast.success('Document retry queued')
                      refresh()
                    } catch (error: any) {
                      toast.error(error.message || 'Retry failed')
                    }
                  }}
                />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
