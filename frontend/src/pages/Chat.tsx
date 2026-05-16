import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Clock, FileText, Loader2, MessageSquare, Sparkles, Send, Upload } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { askQuery, getDocuments, uploadPdf } from "@/lib/api";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  latency?: number;
  timestamp: string;
};

type DocumentItem = {
  id?: string;
  filename?: string;
  name?: string;
};

const RECENT_CHATS_KEY = "rag_recent_chats";

function buildRecentChats(messages: ChatMessage[]) {
  const pairs: Array<{ question: string; answer: string; timestamp: string }> = [];
  let pendingQuestion: ChatMessage | null = null;

  messages.forEach((message) => {
    if (message.role === "user") {
      pendingQuestion = message;
      return;
    }

    if (pendingQuestion) {
      pairs.push({
        question: pendingQuestion.content,
        answer: message.content,
        timestamp: message.timestamp,
      });
      pendingQuestion = null;
    }
  });

  return pairs.slice(-5);
}

function persistRecentChats(messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RECENT_CHATS_KEY, JSON.stringify(buildRecentChats(messages)));
}

export default function Chat() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [query, setQuery] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const data = await getDocuments();
      setDocuments((data.documents ?? []) as DocumentItem[]);
    } catch (error: any) {
      toast.error(error.message || "Failed to load documents");
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    persistRecentChats(messages);
  }, [messages]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadPdf(file);
      toast.success(`${file.name} uploaded`);
      await fetchDocuments();
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    const trimmed = query.trim();
    if (!trimmed || sending) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((current) => [...current, userMessage]);
    setQuery("");
    setSending(true);

    try {
      const result = await askQuery(trimmed);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.answer,
          sources: result.sources,
          latency: result.latency,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error: any) {
      toast.error(error.message || "Failed to get answer");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <AppShell
      title="Chat Workspace"
      description="Talk to your indexed documents in a focused workspace with sources, latency, and document context."
      actions={
        <Button
          variant="outline"
          className="gap-2 border-white/10 bg-white/5 text-white/75 hover:bg-white/10"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Uploading..." : "Upload PDF"}
        </Button>
      }
    >
      <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleUpload} />
      <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-blue-300">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/35">Context panel</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Documents available to chat with</h2>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {loadingDocs ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-white/45">
                Loading documents...
              </div>
            ) : documents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-white/45">
                No documents available yet. Upload a PDF to start talking to your data.
              </div>
            ) : (
              documents.map((doc, index) => (
                <div key={`${doc.filename || doc.name || index}`} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-blue-300">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{doc.filename || doc.name || `Document ${index + 1}`}</p>
                    <p className="text-xs text-white/35">Indexed and searchable</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-white/35">Tip</p>
            <p className="mt-2 text-sm leading-7 text-white/55">
              Keep questions short and specific for better retrieval. The assistant will surface document sources and latency after each reply.
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur overflow-hidden flex flex-col min-h-[72vh]">
          <div className="border-b border-white/10 px-6 py-5">
            <p className="text-xs uppercase tracking-[0.22em] text-white/35">Conversation</p>
            <h3 className="mt-2 text-lg font-semibold text-white">Talk to docs</h3>
          </div>

          <div className="flex-1 px-6 py-6 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="flex h-full min-h-[420px] items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-black/20 text-center">
                <div className="max-w-md px-6">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-blue-300">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Ask anything about your documents</h2>
                  <p className="mt-3 text-sm leading-7 text-white/45">
                    Your answers will be grounded in the uploaded PDFs and displayed with sources.
                  </p>
                </div>
              </div>
            ) : null}

            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[82%] rounded-3xl px-4 py-3 text-sm leading-relaxed ${message.role === "user" ? "bg-blue-600 text-white rounded-br-md" : "bg-white/[0.05] border border-white/10 text-white/85 rounded-bl-md"}`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>

                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3">
                        {message.sources.map((source, index) => (
                          <span key={index} className="inline-flex items-center gap-1 rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-blue-200">
                            <FileText className="h-3 w-3" />
                            {source}
                          </span>
                        ))}
                      </div>
                    )}

                    {message.latency != null && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-white/35">
                        <Clock className="h-3 w-3" />
                        {(message.latency * 1000).toFixed(0)}ms
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {sending && (
              <div className="flex justify-start">
                <div className="rounded-3xl rounded-bl-md border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/45">
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin text-blue-300" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-white/10 px-6 py-5">
            <div className="rounded-[1.6rem] border border-white/10 bg-black/30 p-3">
              <textarea
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about your docs..."
                rows={3}
                className="w-full resize-none bg-transparent px-1 py-2 text-sm text-white outline-none placeholder:text-white/30"
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-white/35">Press Enter to send, Shift+Enter for a new line.</p>
                <Button onClick={handleSend} disabled={sending || !query.trim()} className="gap-2 bg-white text-black hover:bg-white/90">
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
