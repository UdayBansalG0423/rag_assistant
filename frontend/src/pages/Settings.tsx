import { useEffect, useState } from "react";
import { Settings as SettingsIcon, SlidersHorizontal, Braces, Database, Cpu, Save } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "rag_frontend_settings";

type WorkspaceSettings = {
  llmProvider: string;
  embeddingProvider: string;
  vectorProvider: string;
  compactMode: boolean;
};

const defaultSettings: WorkspaceSettings = {
  llmProvider: "backend-managed",
  embeddingProvider: "local",
  vectorProvider: "faiss",
  compactMode: false,
};

export default function Settings() {
  const [settings, setSettings] = useState<WorkspaceSettings>(defaultSettings);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
    } catch {
      setSettings(defaultSettings);
    }
  }, []);

  const persist = () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    toast.success("Workspace settings saved");
  };

  return (
    <AppShell
      title="Settings"
      description="Tune workspace preferences, model provider labels, and compact UI behavior."
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-blue-300">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/35">Workspace settings</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Visual and model preferences</h2>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <label className="grid gap-2">
              <span className="text-sm text-white/50">LLM provider label</span>
              <select
                value={settings.llmProvider}
                onChange={(event) => setSettings((current) => ({ ...current, llmProvider: event.target.value }))}
                className="h-11 rounded-xl border border-white/10 bg-black/20 px-3 text-white outline-none"
              >
                <option value="backend-managed">Backend managed</option>
                <option value="groq">Groq</option>
                <option value="gemini">Gemini</option>
                <option value="ollama">Ollama</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-white/50">Embedding provider</span>
              <input
                value={settings.embeddingProvider}
                onChange={(event) => setSettings((current) => ({ ...current, embeddingProvider: event.target.value }))}
                className="h-11 rounded-xl border border-white/10 bg-black/20 px-3 text-white outline-none"
                placeholder="local"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-white/50">Vector store</span>
              <input
                value={settings.vectorProvider}
                onChange={(event) => setSettings((current) => ({ ...current, vectorProvider: event.target.value }))}
                className="h-11 rounded-xl border border-white/10 bg-black/20 px-3 text-white outline-none"
                placeholder="faiss"
              />
            </label>

            <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <span className="text-sm text-white/70">Compact sidebar mode</span>
              <input
                type="checkbox"
                checked={settings.compactMode}
                onChange={(event) => setSettings((current) => ({ ...current, compactMode: event.target.checked }))}
                className="h-4 w-4 accent-blue-500"
              />
            </label>
          </div>

          <Button className="mt-6 gap-2 bg-white text-black hover:bg-white/90" onClick={persist}>
            <Save className="h-4 w-4" />
            Save settings
          </Button>
        </section>

        <section className="space-y-4">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.22em] text-white/35">Deployment note</p>
            <h3 className="mt-2 text-lg font-semibold text-white">Backend controls the live AI stack</h3>
            <p className="mt-3 text-sm leading-7 text-white/55">
              These settings are saved in the frontend for product feel, but the backend environment still decides the actual model and vector store.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <MiniCard icon={Braces} title="API contract" text="JWT-backed backend endpoints under /api" />
            <MiniCard icon={Database} title="Knowledge base" text="PDF uploads are indexed by the backend" />
            <MiniCard icon={Cpu} title="Response engine" text="LLM provider is selected server-side" />
            <MiniCard icon={SettingsIcon} title="UI persistence" text="Workspace preferences stay local" />
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function MiniCard({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
      <Icon className="h-5 w-5 text-blue-300" />
      <h4 className="mt-4 text-sm font-semibold text-white">{title}</h4>
      <p className="mt-2 text-sm text-white/50">{text}</p>
    </div>
  );
}
