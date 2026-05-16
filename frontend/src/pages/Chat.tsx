import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Clock, FileText, Loader2, MessageSquare, Plus, Sparkles, Send, Upload } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import {
  askQuery,
  createChatSession,
  getChatHistory,
  getChatSessions,
  getDocuments,
  saveChatMessage,
  uploadPdf,
} from "@/lib/api";

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

type ChatSessionItem = {
  id: string;
  title: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export default function Chat() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [query, setQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

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

  const fetchSessions = async (preferLatest = false) => {
    setLoadingSessions(true);
    try {
      const data = await getChatSessions();
      const nextSessions = (data.sessions ?? []) as ChatSessionItem[];
      setSessions(nextSessions);

      if (preferLatest && nextSessions.length > 0) {
        const latest = nextSessions[0];
        setActiveSessionId(latest.id);
        await loadSessionHistory(latest.id);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load chats");
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadSessionHistory = async (sessionId: string) => {
    setLoadingHistory(true);
    try {
      const history = await getChatHistory(sessionId);
      setActiveSessionId(sessionId);
      setMessages(history.messages ?? []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load chat history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const startNewChat = async () => {
    setLoadingHistory(true);
    try {
      const session = await createChatSession();
      setSessions((current) => [session, ...current.filter((item) => item.id !== session.id)]);
      setActiveSessionId(session.id);
      setMessages([]);
      setQuery("");
    } catch (error: any) {
      toast.error(error.message || "Failed to start a new chat");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchSessions(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

    let sessionId = activeSessionId;
    if (!sessionId) {
      try {
        const session = await createChatSession();
        sessionId = session.id;
        setSessions((current) => [session, ...current.filter((item) => item.id !== session.id)]);
        setActiveSessionId(sessionId);
      } catch (error: any) {
        toast.error(error.message || "Failed to create chat session");
        return;
      }
    }

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
      await saveChatMessage({
        session_id: sessionId,
        user_query: trimmed,
        assistant_response: result.answer,
        sources: result.sources,
        latency: result.latency,
        title: trimmed,
      });
      await fetchSessions();
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

          <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/35">Recent chats</p>
                <h3 className="mt-2 text-base font-semibold text-white">Your conversations</h3>
              </div>
              <Button
                variant="outline"
                className="gap-2 border-white/10 bg-white/5 text-white/75 hover:bg-white/10"
                onClick={startNewChat}
              >
                <Plus className="h-4 w-4" />
                New
              </Button>
            </div>

            <div className="mt-4 space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {loadingSessions ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/45">
                  Loading chats...
                </div>
              ) : sessions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/45">
                  No chat sessions yet.
                </div>
              ) : (
                sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => loadSessionHistory(session.id)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${activeSessionId === session.id ? "border-blue-400/30 bg-blue-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium text-white">{session.title || "New chat"}</p>
                      {activeSessionId === session.id ? <span className="text-[10px] uppercase tracking-[0.18em] text-blue-200">Open</span> : null}
                    </div>
                    <p className="mt-1 text-xs text-white/35">
                      {session.updated_at ? new Date(session.updated_at).toLocaleString() : "Recently updated"}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur overflow-hidden flex flex-col min-h-[72vh]">
          <div className="border-b border-white/10 px-6 py-5">
            <p className="text-xs uppercase tracking-[0.22em] text-white/35">Conversation</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">{sessions.find((session) => session.id === activeSessionId)?.title || "Talk to docs"}</h3>
              {loadingHistory ? <span className="text-xs text-white/35">Loading history...</span> : null}
            </div>
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
