import { useRef, useMemo, useState } from "react";
import { toast } from "sonner";
import { FileText, Loader2, RefreshCw, Upload, DatabaseZap, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import UploadProgress from "@/components/UploadProgress";
import { uploadPdf } from "@/services/document.service";
import { useDocumentPolling } from "@/hooks/use-document-polling";
import { DocumentStatusDisplay } from "@/components/DocumentStatusDisplay";

export default function KnowledgeBase() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Use polling hook to automatically update documents
  const { documents, loading, error, refresh, retry, polling } = useDocumentPolling({
    pollInterval: 2000, // Poll every 2 seconds
    enabled: true,
    stopWhenComplete: false, // Keep polling even after completion
  });

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return documents;
    return documents.filter((doc) => {
      const label = (doc.file_name || doc.filename || doc.name || "").toLowerCase();
      return label.includes(query);
    });
  }, [documents, search]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const response = await uploadPdf(file);
      setActiveDocumentId(response.id);
      toast.success(`${response.filename || file.name} uploaded`);
      refresh(); // Trigger immediate refresh
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <AppShell
      title="Knowledge Base"
      description="Upload PDFs, inspect what is indexed, and keep the document library organized."
      actions={
        <div className="flex items-center gap-2">
          <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={handleUpload} />
          <Button onClick={() => inputRef.current?.click()} className="gap-2 bg-white text-black hover:bg-white/90">
            <Upload className="h-4 w-4" />
            Upload
          </Button>
          <Button variant="outline" className="gap-2 border-white/10 bg-white/5 text-white/75 hover:bg-white/10" onClick={refresh}>
            <RefreshCw className={`h-4 w-4 ${polling ? 'animate-spin' : ''}`} />
            {polling ? "Polling..." : "Refresh"}
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[0.6fr_1.4fr]">
        <section className="rounded-[1.25rem] bg-white/[0.02] p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-white/35">Upload docs</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Manage your document library</h2>
          <p className="mt-3 text-sm leading-7 text-white/55">
            Add PDFs to the retrieval store, then use the chat workspace to query them. The UI keeps the flow clear even when the backend is still indexing.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">Processing status</p>
              <div className="mt-2 flex items-center gap-2 text-white">
                {polling ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                    <span>Processing documents...</span>
                  </>
                ) : (
                  <>
                    <DatabaseZap className="h-4 w-4 text-green-400" />
                    <span>{documents.length > 0 ? "Ready" : "Waiting"}</span>
                  </>
                )}
              </div>
            </div>
            <div className="rounded-2xl bg-black/10 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">Document count</p>
              <div className="mt-2 text-white">{documents.length} files</div>
            </div>
          </div>
          {error ? (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
              <span>{error}</span>
              <button type="button" onClick={retry} className="inline-flex items-center gap-2 rounded-lg border border-red-400/20 px-3 py-1.5 text-xs font-medium transition hover:bg-red-500/15">
                <RotateCcw className="h-3.5 w-3.5" />
                Retry
              </button>
            </div>
          ) : null}

          {activeDocumentId ? (
            <div className="mt-4 rounded-2xl bg-black/10 p-3">
              <UploadProgress documentId={activeDocumentId} onRetry={refresh} />
            </div>
          ) : null}
        </section>

        <section className="rounded-[1.25rem] bg-white/[0.02] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/35">Manage documents</p>
              <h3 className="mt-2 text-lg font-semibold text-white">Indexed files</h3>
            </div>
            <div className="w-full max-w-sm">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search documents"
                className="h-10 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white placeholder:text-white/30 outline-none"
              />
            </div>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="space-y-3 rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-white/45">
                <div className="flex items-center gap-2 text-white/70">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading documents...</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                  <div className="h-full w-1/2 animate-pulse rounded-full bg-white/10" />
                </div>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="rounded-2xl bg-black/10 p-4 text-sm text-white/45">
                No documents match this filter.
              </div>
            ) : (
              filteredDocuments.map((doc, index) => (
                <div
                  key={`${doc.id || doc.filename || doc.name || index}`}
                  className="flex items-center gap-3 border-b border-white/6 px-3 py-2 last:border-b-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="rounded-md bg-white/5 p-2 text-blue-300">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white max-w-[52ch]">
                        {doc.file_name || doc.filename || doc.name || `Document ${index + 1}`}
                      </p>
                      <p className="text-[11px] text-white/40 mt-0.5">
                        {doc.status === "completed"
                          ? "Ready"
                          : doc.status === "failed"
                          ? "Failed"
                          : doc.status === "queued"
                          ? "Queued"
                          : "Processing"}
                      </p>
                    </div>
                  </div>
                  <div className="ml-auto">
                    <DocumentStatusDisplay
                      status={doc.status || "processing"}
                      progress={doc.progress}
                      error={doc.error}
                      onRetry={() => {
                        toast.info("Retry feature coming soon");
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
