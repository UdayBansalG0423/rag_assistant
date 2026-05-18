import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Clock3, Upload, MessageSquare, Sparkles, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { getDocuments } from "@/lib/api";

type DocumentItem = {
  filename?: string;
  name?: string;
};

type RecentChat = {
  question: string;
  answer: string;
  timestamp: string;
};

function loadRecentChats(): RecentChat[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem("rag_recent_chats") || "[]") as RecentChat[];
  } catch {
    return [];
  }
}

function StatCard({ label, value, hint, icon: Icon }: { label: string; value: string; hint: string; icon: any }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.25)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/35">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
          <p className="mt-2 text-sm text-white/45">{hint}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-blue-300">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [documentsIndexed, setDocumentsIndexed] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const docs = await getDocuments();
      setDocuments((docs.documents ?? []) as DocumentItem[]);
      setDocumentsIndexed((docs.documents ?? []).length > 0);
      setRecentChats(loadRecentChats());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "Indexed documents",
        value: String(documents.length).padStart(2, "0"),
        hint: documentsIndexed ? "Your knowledge base is ready" : "Upload a PDF to activate retrieval",
        icon: BookOpen,
      },
      {
        label: "Recent chats",
        value: String(recentChats.length).padStart(2, "0"),
        hint: "Saved locally for quick resume",
        icon: MessageSquare,
      },
      {
        label: "Workspace status",
        value: documentsIndexed ? "Live" : "Idle",
        hint: documentsIndexed ? "Queries can use your docs now" : "No indexed docs detected yet",
        icon: Sparkles,
      },
    ],
    [documents.length, documentsIndexed, recentChats.length],
  );

  return (
    <AppShell
      title="Dashboard"
      description="A high-level overview of your document workspace, recent chats, and indexing status."
      actions={
        <Button variant="outline" className="gap-2 border-white/10 bg-white/5 text-white/75 hover:bg-white/10" onClick={fetchData}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      }
    >
      <div className="space-y-6">
        <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(59,130,246,0.18),rgba(99,102,241,0.08)_45%,rgba(255,255,255,0.03))] p-7 shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">Overview</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Upload docs, resume conversations, and keep your workspace moving.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/60">
                The dashboard brings the knowledge base, chat workspace, and account tools into one place so the product feels like a real system instead of isolated screens.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="gap-2 bg-white text-black hover:bg-white/90">
                <Link to="/knowledge-base">
                  <Upload className="h-4 w-4" />
                  Manage documents
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2 border-white/10 bg-white/5 text-white/80 hover:bg-white/10">
                <Link to="/chat">
                  <ArrowRight className="h-4 w-4" />
                  Open chat workspace
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.22em] text-white/35">Quick actions</p>
              <div className="mt-4 space-y-3">
                <Button asChild variant="outline" className="w-full justify-between border-white/10 bg-white/5 text-white/80 hover:bg-white/10">
                  <Link to="/knowledge-base">
                    Upload documents
                    <Upload className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-between border-white/10 bg-white/5 text-white/80 hover:bg-white/10">
                  <Link to="/chat">
                    Talk to docs
                    <MessageSquare className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-between border-white/10 bg-white/5 text-white/80 hover:bg-white/10">
                  <Link to="/profile">
                    Open profile
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/35">Recent chats</p>
                <h3 className="mt-2 text-lg font-semibold text-white">Resume where you left off</h3>
              </div>
              <Clock3 className="h-5 w-5 text-white/30" />
            </div>

            <div className="mt-5 space-y-3">
              {recentChats.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-white/45">
                  No recent chats yet. Start a conversation in the chat workspace and it will show up here.
                </div>
              ) : (
                recentChats.slice(0, 4).map((chat, index) => (
                  <motion.div
                    key={`${chat.timestamp}-${index}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.22em] text-white/35">{new Date(chat.timestamp).toLocaleString()}</p>
                    <p className="mt-2 text-sm font-medium text-white">{chat.question}</p>
                    <p className="mt-2 text-sm text-white/55 line-clamp-2">{chat.answer}</p>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/35">Recent documents</p>
                <h3 className="mt-2 text-lg font-semibold text-white">What’s currently indexed</h3>
              </div>
              <BookOpen className="h-5 w-5 text-white/30" />
            </div>

            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-white/45">
                  Loading document list...
                </div>
              ) : documents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-white/45">
                  No documents indexed yet.
                </div>
              ) : (
                documents.slice(0, 5).map((doc, index) => (
                  <div key={index} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">{doc.filename || doc.name || `Document ${index + 1}`}</p>
                      <p className="text-xs text-white/35">Indexed and ready</p>
                    </div>
                    <Upload className="h-4 w-4 text-blue-300/70" />
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
