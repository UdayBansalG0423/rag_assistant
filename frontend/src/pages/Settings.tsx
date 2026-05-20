import { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, Bell, FileText, Zap, Puzzle, CreditCard, BarChart3, LogOut, Camera, Check, AlertCircle, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";

type SettingTab = "profile" | "security" | "notifications" | "documents" | "ai-preferences" | "integrations" | "billing" | "usage";

interface UserSettings {
  fullName: string;
  email: string;
  language: string;
  timezone: string;
  emailNotifications: boolean;
  digestEmails: boolean;
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingTab>("profile");
  const [settings, setSettings] = useState<UserSettings>({
    fullName: user?.username || "User Name",
    email: user?.email || "user@example.com",
    language: "English",
    timezone: "UTC",
    emailNotifications: true,
    digestEmails: false,
  });

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const navSections = [
    {
      label: "ACCOUNT",
      items: [
        { id: "profile" as const, label: "Profile", icon: User },
        { id: "security" as const, label: "Security", icon: Lock },
        { id: "notifications" as const, label: "Notifications", icon: Bell },
      ],
    },
    {
      label: "WORKSPACE",
      items: [
        { id: "documents" as const, label: "Documents", icon: FileText },
        { id: "ai-preferences" as const, label: "AI Preferences", icon: Zap },
        { id: "integrations" as const, label: "Integrations", icon: Puzzle },
      ],
    },
    {
      label: "BILLING",
      items: [
        { id: "billing" as const, label: "Plan & Billing", icon: CreditCard },
        { id: "usage" as const, label: "Usage", icon: BarChart3 },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-64 border-r border-border bg-card flex flex-col"
      >
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-display font-bold">Settings</h2>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {navSections.map((section) => (
            <div key={section.label}>
              <h3 className="text-xs font-mono uppercase text-muted-foreground tracking-wider px-4 mb-3">{section.label}</h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <motion.li key={item.id} whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                      <button
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 font-medium text-sm transition-all duration-200 ${
                          isActive
                            ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        }`}
                      >
                        <IconComponent className="w-4 h-4 flex-shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <motion.button
            whileHover={{ x: 4 }}
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 font-medium text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Sign Out</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex-1 overflow-y-auto"
      >
        <div className="max-w-4xl mx-auto p-8">
          {/* Profile Section */}
          {activeTab === "profile" && (
            <div className="space-y-8">
              <HeaderSection title="Profile" description="Manage your account information" />

              {/* Avatar Section */}
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center gap-6 p-6 rounded-lg border border-border bg-card">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center text-accent-foreground text-2xl font-bold font-display">
                  {settings.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Profile Picture</h3>
                  <button className="px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors flex items-center gap-2 text-sm font-medium">
                    <Camera className="w-4 h-4" />
                    Change Avatar
                  </button>
                </div>
              </motion.div>

              {/* Form Fields */}
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormInput label="Full Name" value={settings.fullName} onChange={(val) => updateSetting("fullName", val)} />
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={settings.email}
                        disabled
                        className="flex-1 px-4 py-2 rounded-lg border border-border bg-secondary text-muted-foreground disabled:cursor-not-allowed"
                      />
                      <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                        <Check className="w-3 h-3" />
                        Verified
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormSelect label="Language" value={settings.language} options={["English", "Spanish", "French", "German"]} onChange={(val: string) => updateSetting("language", val)} />
                  <FormSelect label="Timezone" value={settings.timezone} options={["UTC", "EST", "CST", "PST", "GMT"]} onChange={(val: string) => updateSetting("timezone", val)} />
                </div>
              </motion.div>

              <motion.button initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="px-6 py-2 rounded-lg bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition-colors">
                Save Changes
              </motion.button>
            </div>
          )}

          {/* Security Section */}
          {activeTab === "security" && (
            <div className="space-y-8">
              <HeaderSection title="Security" description="Manage your password and security settings" />

              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-4">
                <SettingCard title="Password" description="Change your password regularly">
                  <button className="px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors text-sm font-medium">Change Password</button>
                </SettingCard>

                <SettingCard title="Two-Factor Authentication" description="Add an extra layer of security">
                  <button className="px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors text-sm font-medium">Enable 2FA</button>
                </SettingCard>

                <SettingCard title="Active Sessions" description="Manage your active sessions">
                  <div className="space-y-3">
                    <SessionItem device="Chrome on macOS" location="San Francisco, CA" lastActive="Active now" />
                    <SessionItem device="Safari on iPhone" location="San Francisco, CA" lastActive="2 hours ago" />
                  </div>
                </SettingCard>
              </motion.div>
            </div>
          )}

          {/* Notifications Section */}
          {activeTab === "notifications" && (
            <div className="space-y-8">
              <HeaderSection title="Notifications" description="Control how you receive notifications" />

              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-3">
                <ToggleSetting title="Email Notifications" description="Receive updates about your documents" enabled={settings.emailNotifications} onChange={(val) => updateSetting("emailNotifications", val)} />
                <ToggleSetting title="Weekly Digest" description="Get a weekly summary of your activity" enabled={settings.digestEmails} onChange={(val) => updateSetting("digestEmails", val)} />
                <ToggleSetting title="Document Updates" description="Notify me when documents are processed" enabled={true} onChange={() => {}} />
              </motion.div>
            </div>
          )}

          {/* Documents Section */}
          {activeTab === "documents" && (
            <div className="space-y-8">
              <HeaderSection title="Documents" description="Manage your document storage" />

              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-4">
                <div className="p-6 rounded-lg border border-border bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Storage Usage</h3>
                    <span className="text-accent font-bold">2.4 GB / 10 GB</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-secondary">
                    <div className="h-full w-1/4 rounded-full bg-accent" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">You're using 24% of your storage</p>
                </div>

                <SettingCard title="Auto-delete Documents" description="Automatically delete old documents">
                  <FormSelect label="" value="30" options={["Never", "30 days", "90 days", "1 year"]} onChange={() => {}} />
                </SettingCard>
              </motion.div>
            </div>
          )}

          {/* AI Preferences Section */}
          {activeTab === "ai-preferences" && (
            <div className="space-y-8">
              <HeaderSection title="AI Preferences" description="Configure AI processing" />

              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-4">
                <FormSelect label="Default Model" value="GPT-4o-mini" options={["GPT-4o-mini", "GPT-4", "Claude 3"]} onChange={(val: string) => {}} />
                <FormSelect label="Response Style" value="Balanced" options={["Concise", "Balanced", "Detailed"]} onChange={(val: string) => {}} />
                <FormSelect label="Citation Format" value="Inline" options={["Inline", "Footnotes", "Bibliography"]} onChange={(val: string) => {}} />
                <ToggleSetting title="Auto-suggest Queries" description="Suggest follow-up questions automatically" enabled={true} onChange={() => {}} />
              </motion.div>
            </div>
          )}

          {/* Integrations Section */}
          {activeTab === "integrations" && (
            <div className="space-y-8">
              <HeaderSection title="Integrations" description="Connect ChatRAG with your tools" />

              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="grid md:grid-cols-2 gap-4">
                {["Slack", "Notion", "Zapier", "GitHub", "Google Drive", "Dropbox"].map((integration) => (
                  <motion.button key={integration} whileHover={{ y: -4 }} className="p-4 rounded-lg border border-border bg-card hover:border-accent/50 transition-colors text-left group">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{integration}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </div>
          )}

          {/* Billing Section */}
          {activeTab === "billing" && (
            <div className="space-y-8">
              <HeaderSection title="Plan & Billing" description="Manage your subscription" />

              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-4">
                <div className="p-6 rounded-lg border-2 border-accent bg-accent/5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold font-display">Pro Plan</h3>
                      <p className="text-sm text-muted-foreground">$29/month</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">Active</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Renews on February 15, 2026</p>
                  <button className="px-4 py-2 rounded-lg border border-accent hover:bg-accent/10 transition-colors font-medium text-sm">Manage Subscription</button>
                </div>

                <div className="p-4 rounded-lg border border-border bg-card">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    Billing History
                  </h4>
                  <div className="space-y-2">
                    {[
                      { date: "Jan 15, 2026", amount: "$29.00", status: "Paid" },
                      { date: "Dec 15, 2025", amount: "$29.00", status: "Paid" },
                    ].map((invoice, i) => (
                      <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-border/50 last:border-0">
                        <span className="text-muted-foreground">{invoice.date}</span>
                        <span className="font-semibold">{invoice.amount}</span>
                        <span className="text-green-400 text-xs">{invoice.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Usage Section */}
          {activeTab === "usage" && (
            <div className="space-y-8">
              <HeaderSection title="Usage" description="Monitor your account usage" />

              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="grid md:grid-cols-2 gap-6">
                <UsageCard title="Documents Processed" value="1,234" period="This month" />
                <UsageCard title="Queries" value="8,942" period="This month" />
                <UsageCard title="Storage Used" value="2.4 GB" period="of 10 GB" />
                <UsageCard title="API Calls" value="45,821" period="This month" />
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function HeaderSection({ title, description }: { title: string; description: string }) {
  return (
    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
      <h2 className="text-3xl font-display font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}

function SettingCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <motion.div whileHover={{ borderColor: "var(--color-accent)" }} className="p-6 rounded-lg border border-border bg-card transition-colors">
      <div className="mb-4">
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </motion.div>
  );
}

function FormInput({ label, value, onChange, disabled = false }: { label: string; value: string; onChange?: (val: string) => void; disabled?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-accent transition-colors"
      />
    </div>
  );
}

function FormSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (val: string) => void }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium mb-2">{label}</label>}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-accent transition-colors cursor-pointer">
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function ToggleSetting({ title, description, enabled, onChange }: { title: string; description: string; enabled: boolean; onChange: (val: boolean) => void }) {
  return (
    <motion.div whileHover={{ borderColor: "var(--color-accent)" }} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card transition-colors">
      <div>
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <motion.button onClick={() => onChange(!enabled)} className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? "bg-accent" : "bg-secondary"}`} whileHover={{ scale: 1.05 }}>
        <motion.div animate={{ x: enabled ? 24 : 4 }} className="absolute top-1 w-4 h-4 rounded-full bg-white" />
      </motion.button>
    </motion.div>
  );
}

function SessionItem({ device, location, lastActive }: { device: string; location: string; lastActive: string }) {
  return (
    <div className="p-3 rounded-lg border border-border bg-secondary text-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium">{device}</p>
          <p className="text-xs text-muted-foreground">{location}</p>
        </div>
        <span className="text-xs text-muted-foreground">{lastActive}</span>
      </div>
    </div>
  );
}

function UsageCard({ title, value, period }: { title: string; value: string; period: string }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="p-6 rounded-lg border border-border bg-card">
      <p className="text-sm text-muted-foreground mb-2">{title}</p>
      <p className="text-3xl font-bold font-display mb-1">{value}</p>
      <p className="text-xs text-muted-foreground">{period}</p>
    </motion.div>
  );
}
