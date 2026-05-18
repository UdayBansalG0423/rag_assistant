import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { FileText, Loader2, RefreshCw, Upload, DatabaseZap, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import UploadProgress from "@/components/UploadProgress";
import { getDocuments, uploadPdf } from "@/services/document.service";

type DocumentItem = {
  id?: string;
  filename?: string;
  name?: string;
};

export default function KnowledgeBase() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const docs = await getDocuments();
      setDocuments((docs.documents ?? []) as DocumentItem[]);
    } catch (error: any) {
      toast.error(error.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return documents;
    return documents.filter((doc) => {
      const label = (doc.filename || doc.name || "").toLowerCase();
      return label.includes(query);
    });
  }, [documents, search]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadPdf(file);
      setActiveDocumentId(response.id);
      toast.success(`${response.filename || file.name} uploaded`);
      await loadDocuments();
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <AppShell
      title="Knowledge Base"
      description="Upload PDFs, inspect what is indexed, and keep the document library organized."
      actions={
        <Button variant="outline" className="gap-2 border-white/10 bg-white/5 text-white/75 hover:bg-white/10" onClick={loadDocuments}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.22em] text-white/35">Upload docs</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Manage your document library</h2>
          <p className="mt-3 text-sm leading-7 text-white/55">
            Add PDFs to the retrieval store, then use the chat workspace to query them. The UI keeps the flow clear even when the backend is still indexing.
          </p>

          <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={handleUpload} />
          <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-black/20 p-5">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-blue-300">
                <Upload className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">Drop PDFs into the knowledge base</p>
                <p className="mt-1 text-sm text-white/45">Only PDFs are accepted by the current backend endpoint.</p>
                <Button
                  className="mt-4 gap-2 bg-white text-black hover:bg-white/90"
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? "Uploading..." : "Upload PDF"}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">Indexed status</p>
              <div className="mt-2 flex items-center gap-2 text-white">
                <DatabaseZap className="h-4 w-4 text-blue-300" />
                <span>{documents.length > 0 ? "Active" : "Waiting for documents"}</span>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">Document count</p>
              <div className="mt-2 text-white">{documents.length} files</div>
            </div>
          </div>

          {activeDocumentId ? (
            <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-4">
              <UploadProgress documentId={activeDocumentId} />
            </div>
          ) : null}
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
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

          <div className="mt-5 space-y-3">
            {loading ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-white/45">
                Loading documents...
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-white/45">
                No documents match this filter.
              </div>
            ) : (
              filteredDocuments.map((doc, index) => (
                <div key={`${doc.filename || doc.name || index}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-blue-300">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{doc.filename || doc.name || `Document ${index + 1}`}</p>
                      <p className="text-xs text-white/35">Ready for chat workspace</p>
                    </div>
                  </div>
                  <button className="rounded-lg p-2 text-white/30 hover:bg-white/5 hover:text-white/70">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
