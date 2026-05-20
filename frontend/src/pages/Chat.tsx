import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { FileText, Loader2, Plus, Sparkles, Send, PanelLeft, Paperclip, Settings, MoreVertical, X } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { createChatSession, getChatHistory, getChatSessions, saveChatMessage } from "@/services/chat.service";
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
  const [showDocuments, setShowDocuments] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
    fetchSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      setMessages(
        (history.messages ?? []).map((message) => ({
          ...message,
          latency: message.latency ?? undefined,
          timestamp: message.timestamp || new Date().toISOString(),
        })) as ChatMessage[]
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to load chat history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const startNewChat = async () => {
    try {
      const session = await createChatSession();
      await fetchSessions(true);
      setMessages([]);
      setSelectedDocs({});
    } catch (error: any) {
      toast.error(error.message || "Failed to create new chat");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadPdf(file);
      toast.success("Document uploaded successfully");
      await fetchDocuments();
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    if (!query.trim() || !activeSessionId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setSending(true);

    try {
      const response = await askQuery(query);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.answer || "No response received",
        sources: response.sources || [],
        latency: response.latency,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Save message to session
      if (activeSessionId) {
        await saveChatMessage({
          session_id: activeSessionId,
          user_query: query,
          assistant_response: response.answer || "No response received",
          sources: response.sources || [],
          latency: response.latency,
        });
      }
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

  const currentSession = sessions.find((s) => s.id === activeSessionId);

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden">
      <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleUpload} />

      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0 bg-card flex flex-col h-full border-r border-border overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-display font-bold">ChatRAG</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 hover:bg-secondary rounded-lg transition-colors md:hidden"
              >
                <PanelLeft className="w-4 h-4" />
              </motion.button>
            </div>

            {/* New Chat Button */}
            <div className="p-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startNewChat}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </motion.button>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
              {loadingSessions ? (
                <div className="text-xs text-muted-foreground px-3 py-8 text-center">Loading chats...</div>
              ) : sessions.length === 0 ? (
                <div className="text-xs text-muted-foreground px-3 py-8 text-center">No conversations yet</div>
              ) : (
                <div className="space-y-1">
                  <h3 className="text-xs font-mono uppercase text-muted-foreground px-3 py-2 tracking-wider">Recent</h3>
                  {sessions.map((session) => (
                    <motion.button
                      key={session.id}
                      whileHover={{ x: 4 }}
                      onClick={() => loadSessionHistory(session.id)}
                      className={`w-full text-left truncate px-3 py-2.5 rounded-lg text-sm transition-all ${
                        activeSessionId === session.id
                          ? "bg-accent text-accent-foreground font-medium shadow-lg shadow-accent/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      {session.title || "New chat"}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Documents Section */}
            <div className="p-3 border-t border-border">
              <motion.button
                whileHover={{ x: 4 }}
                onClick={() => setShowDocuments(!showDocuments)}
                className="w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">Documents</span>
                <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{documents.length}</span>
              </motion.button>

              {showDocuments && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-2 pt-2 border-t border-border space-y-2">
                  {loadingDocs ? (
                    <div className="text-xs text-muted-foreground text-center py-4">Loading...</div>
                  ) : documents.length === 0 ? (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full text-xs text-center py-3 px-2 rounded-lg border border-dashed border-border hover:border-accent text-muted-foreground hover:text-accent transition-colors"
                    >
                      Upload documents
                    </button>
                  ) : (
                    documents.map((doc) => (
                      <label key={doc.id} className="flex items-start gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedDocs[doc.id || ""] || false}
                          onChange={() => {
                            if (!doc.id) return;
                            const id = doc.id;
                            setSelectedDocs((s) => ({ ...s, [id]: !s[id] }));
                          }}
                          className="mt-0.5 w-4 h-4 rounded border-border accent-accent"
                        />
                        <span className="text-xs text-foreground truncate">{doc.filename || doc.name || "Document"}</span>
                      </label>
                    ))
                  )}
                </motion.div>
              )}
            </div>

            {/* Settings Link */}
            <div className="p-3 border-t border-border mt-auto">
              <Link to="/settings" className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-background relative h-full">
        {/* Header */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 left-0 px-6 py-4 z-10 flex items-center justify-between bg-background/80 border-b border-border backdrop-blur-md"
        >
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-card rounded-lg transition-colors md:hidden"
              >
                <PanelLeft className="w-5 h-5" />
              </motion.button>
            )}
            <h1 className="text-lg font-display font-bold truncate">{currentSession?.title || "New Chat"}</h1>
          </div>
          <button className="p-2 hover:bg-card rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-muted-foreground" />
          </button>
        </motion.div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center px-6 pb-20">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 border border-accent/30"
              >
                <Sparkles className="w-8 h-8 text-accent" />
              </motion.div>

              <motion.h2 initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-2xl font-display font-bold mb-2">
                How can I help you today?
              </motion.h2>

              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 max-w-2xl w-full">
                {["Summarize the key points", "Extract action items", "What are the main conclusions?"].map((suggestedPrompt, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ y: -2 }}
                    onClick={() => {
                      setQuery(suggestedPrompt);
                      setTimeout(() => inputRef.current?.focus(), 10);
                    }}
                    className="border border-border bg-card hover:border-accent hover:bg-secondary rounded-lg px-4 py-3 text-sm text-left transition-all text-foreground"
                  >
                    {suggestedPrompt}
                  </motion.button>
                ))}
              </motion.div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
              <AnimatePresence>
                {messages.map((message, idx) => {
                  const isUser = message.role === "user";

                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[80%] ${isUser ? "" : "w-full"}`}>
                        {isUser ? (
                          <div className="rounded-2xl bg-accent text-accent-foreground px-4 py-3 text-sm leading-relaxed break-words">
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-start gap-3"
                          >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mt-1">
                              <Sparkles className="w-4 h-4 text-accent" />
                            </div>
                            <div className="flex-1 text-sm leading-relaxed text-foreground prose prose-invert max-w-none">
                              <p className="whitespace-pre-wrap">{message.content}</p>

                              {message.sources && message.sources.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-border">
                                  <p className="text-xs text-muted-foreground font-medium mb-2">Sources:</p>
                                  <ul className="space-y-1">
                                    {message.sources.map((source, i) => (
                                      <li key={i} className="text-xs text-muted-foreground">
                                        • {source}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {message.latency && (
                                <p className="text-xs text-muted-foreground mt-3">Response time: {(message.latency / 1000).toFixed(2)}s</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {sending && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-accent animate-spin" />
                    </div>
                    <div className="py-3 text-sm text-muted-foreground">Thinking...</div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="px-6 py-6 border-t border-border bg-background/50 backdrop-blur-sm"
        >
          <div className="max-w-3xl mx-auto flex gap-3 items-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="p-3 rounded-lg border border-border hover:bg-card disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <Paperclip className="w-5 h-5" />
            </motion.button>

            <textarea
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your documents..."
              rows={1}
              className="flex-1 px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors resize-none max-h-32"
            />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={sending || !query.trim() || !activeSessionId}
              className="p-3 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
