import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, KeyRound, Shield } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function Profile() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.username ?? "");
  const [apiKeyLabel, setApiKeyLabel] = useState("backend-jwt");

  const profileSummary = useMemo(
    () => [
      { label: "Account", value: user?.username ?? "Unknown user" },
      { label: "Access model", value: "JWT protected backend" },
      { label: "Workspace", value: "NeuralDoc" },
    ],
    [user?.username],
  );

  return (
    <AppShell
      title="Profile"
      description="Profile details, access tokens, and API key preferences for the workspace."
      actions={
        <Button
          variant="outline"
          className="gap-2 border-white/10 bg-white/5 text-white/75 hover:bg-white/10"
          onClick={async () => {
            if (typeof window === "undefined") return;
            await navigator.clipboard.writeText(window.localStorage.getItem("rag_auth_token") || "");
            toast.success("Access token copied");
          }}
        >
          <Copy className="h-4 w-4" />
          Copy token
        </Button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(59,130,246,0.8),rgba(99,102,241,0.9))] text-2xl font-semibold text-white shadow-[0_18px_50px_rgba(59,130,246,0.25)]">
              {(user?.username || "B").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/35">Signed in as</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{user?.username ?? "Workspace user"}</h2>
              <p className="mt-2 text-sm text-white/45">Manage your identity and the way the workspace is presented.</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {profileSummary.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm">
                <span className="text-white/45">{item.label}</span>
                <span className="text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.22em] text-white/35">API keys / settings</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Account preferences</h3>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm text-white/50">Display name</span>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="h-11 rounded-xl border border-white/10 bg-black/20 px-3 text-white outline-none"
                placeholder="Your display name"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-white/50">Primary key label</span>
              <input
                value={apiKeyLabel}
                onChange={(event) => setApiKeyLabel(event.target.value)}
                className="h-11 rounded-xl border border-white/10 bg-black/20 px-3 text-white outline-none"
                placeholder="backend-jwt"
              />
            </label>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-white">
                <KeyRound className="h-4 w-4 text-blue-300" />
                <span className="font-medium">Session token</span>
              </div>
              <p className="mt-2 text-sm text-white/45">
                The UI stores the backend JWT in local storage to keep authenticated requests working.
              </p>
            </div>

            <Button className="mt-2 gap-2 bg-white text-black hover:bg-white/90">
              <Shield className="h-4 w-4" />
              Save profile preferences
            </Button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
