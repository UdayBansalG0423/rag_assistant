import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Clock, FileText, Loader2, Plus, Sparkles, Send, PanelLeft, Paperclip, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  createChatSession,
  getChatHistory,
  getChatSessions,
  saveChatMessage,
} from "@/services/chat.service";
import { askQuery } from "@/services/rag.service";
import { getDocuments, uploadPdf } from "@/services/document.service";

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
  const [selectedDocs, setSelectedDocs] = useState<Record<string, boolean>>({});
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  const toggleDoc = (id?: string) => {
    if (!id) return;
    setSelectedDocs((s) => ({ ...s, [id]: !s[id] }));
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
      setMessages(
        (history.messages ?? []).map((message) => ({
          ...message,
          latency: message.latency ?? undefined,
          timestamp: message.timestamp ?? new Date().toISOString(),
        })),
      );
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
    <div className="flex h-screen w-screen bg-[#212121] text-slate-300 font-sans overflow-hidden">
      <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleUpload} />

      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 bg-[#171717] flex flex-col h-full overflow-hidden whitespace-nowrap"
          >
            <div className="flex items-center justify-between p-3">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-white/50 hover:text-white transition rounded-md ml-auto lg:hidden"
              >
                <PanelLeft className="h-5 w-5" />
              </button>
            </div>
            <div className="px-3">
              <Button
                variant="ghost"
                className="justify-between text-white/80 hover:bg-white/10 w-full rounded-xl bg-white/5 py-6"
                onClick={startNewChat}
              >
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-white/10 p-1">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">New chat</span>
                </div>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              <p className="px-2 text-xs font-semibold text-white/40 mb-3">Recent</p>
              {loadingSessions ? (
                <p className="text-xs text-white/30 px-2 mt-4">Loading chats...</p>
              ) : sessions.length === 0 ? (
                <p className="text-xs text-white/30 px-2">No past conversations.</p>
              ) : (
                sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => loadSessionHistory(session.id)}
                    className={`w-full text-left truncate px-3 py-2 rounded-lg text-sm transition ${
                      activeSessionId === session.id
                        ? "bg-[#2f2f2f] text-white font-medium"
                        : "text-white/60 hover:bg-white/5"
                    }`}
                  >
                    {session.title || "New chat"}
                  </button>
                ))
              )}
            </div>

            <div className="p-3 border-t border-white/5 mt-auto">
              <Link to="/knowledge-base" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 text-sm font-medium text-white/70 transition">
                <ArrowLeft className="h-4 w-4" />
                Back to Workspace
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#212121] relative h-full">
        {/* Top Header */}
        <div className="sticky top-0 left-0 p-3 z-10 flex items-center bg-[#212121]/95 text-white/70 backdrop-blur-md">
          {!isSidebarOpen && (
            <button
              title="Open sidebar"
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-white/5 rounded-lg transition mr-2"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
          )}
          <div className="font-medium px-2 py-1 rounded-md text-sm">
            {sessions.find((s) => s.id === activeSessionId)?.title || "NeuralDoc Chat"}
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto w-full scroll-smooth">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center px-4 pb-20">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-white/80 ring-1 ring-white/10">
                <Sparkles className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">How can I help you today?</h2>
              <div className="mt-8 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 max-w-2xl w-full">
                {["Summarize the key points", "Extract action items", "What are the main conclusions?"].map((suggestedPrompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(suggestedPrompt);
                      setTimeout(() => inputRef.current?.focus(), 10);
                    }}
                    className="border border-white/10 bg-[#2f2f2f]/50 hover:bg-[#2f2f2f] rounded-xl px-4 py-3 text-sm text-left transition-colors text-white/70"
                  >
                    {suggestedPrompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
              <AnimatePresence>
                {messages.map((message) => {
                  const isSystemMsg = message.role === "assistant" && message.content.includes("No relevant information found");
                  const isUser = message.role === "user";

                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                      {isUser ? (
                        <div className="max-w-[80%] lg:max-w-[70%] rounded-3xl bg-[#2f2f2f] px-5 py-3 text-[15px] leading-[1.6] text-white break-words">
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                      ) : (
                        <div className="max-w-full w-full flex items-start gap-4">
                          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10">
                            <Sparkles className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            {isSystemMsg ? (
                              <div className="flex items-center gap-3 px-2 py-1 text-sm text-yellow-500/80">
                                <span className="text-xl">⚠️</span>
                                <span className="leading-[1.6]">{message.content}</span>
                              </div>
                            ) : (
                              <div className="text-slate-200 text-[15px] leading-[1.65] tracking-[0.011em]">
                                <p className="whitespace-pre-wrap [&_li]:mb-2 [&_ul]:pl-4 [&_ol]:pl-4 ai-response-text">
                                  {message.content}
                                </p>
        
                                {message.sources && message.sources.length > 0 && (
                                  <div className="mt-4 flex flex-wrap gap-2">
                                    {message.sources.map((source, index) => (
                                      <span key={index} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#2f2f2f]/60 px-2.5 py-1 text-xs text-white/70">
                                        <FileText className="h-3 w-3" />
                                        {source}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
        
                            {message.latency != null && (
                              <div className="mt-2 text-xs font-medium text-white/30">
                                {(message.latency * 1000).toFixed(0)} ms
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {sending && (
                <div className="flex items-center gap-4 text-white/50 pt-2">
                   <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
                     <Sparkles className="h-4 w-4" />
                   </div>
                   <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Dynamic Chat Input Bar */}
        <div className="shrink-0 bg-transparent px-4 pb-6 pt-2">
          <div className="mx-auto max-w-3xl">
            <div className="relative flex flex-col rounded-[26px] bg-[#2f2f2f] focus-within:ring-1 focus-within:ring-white/20 p-2 shadow-sm transition">
              <textarea
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                rows={1}
                className="max-h-32 min-h-[44px] w-full resize-none bg-transparent px-11 py-3 pr-12 text-[15px] text-white outline-none placeholder:text-white/40"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Upload PDF document"
                className="absolute left-3 top-3 p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
              >
                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
              </button>

              <button
                onClick={handleSend}
                disabled={sending || !query.trim()}
                className={`absolute right-3 top-3 p-1.5 rounded-full transition-colors flex items-center justify-center ${
                  query.trim() ? "bg-white text-black hover:bg-white/90" : "bg-white/10 text-white/30"
                }`}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2 text-center text-xs text-white/40">
               Answers are grounded by your indexed document library. Upload explicitly here or in the Knowledge Base.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
