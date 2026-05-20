import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
	ArrowLeft,
	User,
	Lock,
	Bell,
	FolderOpen,
	Zap,
	Link as LinkIcon,
	CreditCard,
	BarChart3,
	Upload,
	Trash2,
	Save,
	Camera,
	Eye,
	EyeOff,
	Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

type SettingsTab = "profile" | "security" | "notifications" | "documents" | "ai-preferences" | "integrations" | "plan" | "usage";

const STORAGE_KEY = "rag_frontend_settings";

type UserSettings = {
	avatar?: string;
	language: string;
	timezone: string;
	emailNotifications: boolean;
	digests: boolean;
	modelDefault: string;
	responseStyle: "concise" | "balanced" | "detailed";
	citationDisplay: "always" | "hover" | "never";
	autoSuggest: boolean;
};

const defaultSettings: UserSettings = {
	language: "en",
	timezone: "UTC",
	emailNotifications: true,
	digests: false,
	modelDefault: "gpt-4-turbo",
	responseStyle: "balanced",
	citationDisplay: "always",
	autoSuggest: true,
};

const tabs = [
	{
		label: "Account",
		items: [
			{ id: "profile", label: "Profile", icon: User },
			{ id: "security", label: "Security", icon: Lock },
			{ id: "notifications", label: "Notifications", icon: Bell },
		],
	},
	{
		label: "Workspace",
		items: [
			{ id: "documents", label: "Documents", icon: FolderOpen },
			{ id: "ai-preferences", label: "AI Preferences", icon: Zap },
			{ id: "integrations", label: "Integrations", icon: LinkIcon },
		],
	},
	{
		label: "Billing",
		items: [
			{ id: "plan", label: "Plan & Billing", icon: CreditCard },
			{ id: "usage", label: "Usage", icon: BarChart3 },
		],
	},
];

export default function Settings() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
	const [settings, setSettings] = useState<UserSettings>(defaultSettings);
	const [isSaving, setIsSaving] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

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

	const saveSettings = () => {
		setIsSaving(true);
		setTimeout(() => {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
			toast.success("Settings saved");
			setIsSaving(false);
		}, 500);
	};

	const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
		setSettings((prev) => ({ ...prev, [key]: value }));
	};

	return (
		<div className="min-h-screen bg-background text-foreground">
			{/* Header */}
			<div className="sticky top-0 z-40 border-b border-border bg-background/75 backdrop-blur-xl">
				<div className="flex items-center gap-4 px-6 py-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate("/dashboard")}
						className="text-muted-foreground hover:text-foreground"
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<h1 className="text-2xl font-display font-bold">Settings</h1>
				</div>
			</div>

			<div className="flex min-h-[calc(100vh-65px)]">
				{/* Sidebar Navigation */}
				<aside className="hidden md:flex md:w-64 border-r border-border bg-card/50 flex-col p-6 space-y-8">
					{tabs.map((section) => (
						<div key={section.label}>
							<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
								{section.label}
							</p>
							<nav className="space-y-1">
								{section.items.map((item) => {
									const Icon = item.icon;
									const isActive = activeTab === item.id;
									return (
										<motion.button
											key={item.id}
											onClick={() => setActiveTab(item.id as SettingsTab)}
											className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
												isActive
													? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
													: "text-muted-foreground hover:text-foreground hover:bg-card"
											}`}
											whileHover={{ x: 4 }}
										>
											<Icon className="h-4 w-4" />
											{item.label}
										</motion.button>
									);
								})}
							</nav>
						</div>
					))}
				</aside>

				{/* Mobile Tab Selector */}
				<div className="md:hidden w-full border-b border-border bg-card/50 px-4 py-3 overflow-x-auto">
					<div className="flex gap-2">
						{tabs.flatMap((section) =>
							section.items.map((item) => (
								<Button
									key={item.id}
									variant={activeTab === item.id ? "default" : "outline"}
									size="sm"
									onClick={() => setActiveTab(item.id as SettingsTab)}
									className="whitespace-nowrap"
								>
									{item.label}
								</Button>
							)),
						)}
					</div>
				</div>

				{/* Main Content */}
				<main className="flex-1 p-6 md:p-12 max-w-3xl">
					<AnimatePresence mode="wait">
						<motion.div
							key={activeTab}
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							transition={{ duration: 0.2 }}
							className="space-y-6"
						>
							{/* Profile Tab */}
							{activeTab === "profile" && (
								<div className="space-y-6">
									<div>
										<h2 className="text-2xl font-display font-bold mb-1">Profile</h2>
										<p className="text-muted-foreground">Manage your account information</p>
									</div>

									<div className="rounded-lg border border-border bg-card p-6 space-y-6">
										{/* Avatar */}
										<div>
											<label className="block text-sm font-medium mb-3">Profile picture</label>
											<div className="flex items-center gap-4">
												<div className="h-16 w-16 rounded-full bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center text-white font-semibold text-lg">
													{user?.username?.charAt(0).toUpperCase() || "U"}
												</div>
												<Button variant="outline" className="gap-2">
													<Camera className="h-4 w-4" />
													Change avatar
												</Button>
											</div>
										</div>

										{/* Name */}
										<div>
											<label className="block text-sm font-medium mb-2">Full name</label>
											<Input
												defaultValue={user?.username || ""}
												disabled
												className="bg-muted/50"
											/>
										</div>

										{/* Email */}
										<div>
											<label className="block text-sm font-medium mb-2 flex items-center gap-2">
												Email address
												<span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full flex items-center gap-1">
													<Check className="h-3 w-3" /> Verified
												</span>
											</label>
											<Input
												type="email"
												defaultValue={user?.email || ""}
												disabled
												className="bg-muted/50"
											/>
										</div>

										{/* Language */}
										<div>
											<label className="block text-sm font-medium mb-2">Language</label>
											<select
												value={settings.language}
												onChange={(e) => updateSetting("language", e.target.value)}
												className="w-full h-10 rounded-lg border border-border bg-card px-3 text-foreground outline-none focus:ring-2 focus:ring-accent"
											>
												<option value="en">English</option>
												<option value="es">Spanish</option>
												<option value="fr">French</option>
												<option value="de">German</option>
											</select>
										</div>

										{/* Timezone */}
										<div>
											<label className="block text-sm font-medium mb-2">Timezone</label>
											<select
												value={settings.timezone}
												onChange={(e) => updateSetting("timezone", e.target.value)}
												className="w-full h-10 rounded-lg border border-border bg-card px-3 text-foreground outline-none focus:ring-2 focus:ring-accent"
											>
												<option value="UTC">UTC</option>
												<option value="EST">Eastern</option>
												<option value="CST">Central</option>
												<option value="MST">Mountain</option>
												<option value="PST">Pacific</option>
											</select>
										</div>

										<Button onClick={saveSettings} disabled={isSaving} className="gap-2">
											<Save className="h-4 w-4" />
											{isSaving ? "Saving..." : "Save changes"}
										</Button>
									</div>

									{/* Danger Zone */}
									<div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6">
										<h3 className="font-semibold text-destructive mb-2">Delete account</h3>
										<p className="text-sm text-muted-foreground mb-4">
											Permanently delete your account and all associated data. This action cannot be undone.
										</p>
										<Button variant="destructive" className="gap-2">
											<Trash2 className="h-4 w-4" />
											Delete account
										</Button>
									</div>
								</div>
							)}

							{/* Security Tab */}
							{activeTab === "security" && (
								<div className="space-y-6">
									<div>
										<h2 className="text-2xl font-display font-bold mb-1">Security</h2>
										<p className="text-muted-foreground">Manage your security settings</p>
									</div>

									<div className="rounded-lg border border-border bg-card p-6 space-y-6">
										<div>
											<label className="block text-sm font-medium mb-2">Change password</label>
											<div className="space-y-3">
												<div className="relative">
													<Input
														type={showPassword ? "text" : "password"}
														placeholder="Current password"
														className="pr-10"
													/>
													<button
														type="button"
														onClick={() => setShowPassword(!showPassword)}
														className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
													>
														{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
													</button>
												</div>
												<Input
													type="password"
													placeholder="New password"
													className="pr-10"
												/>
												<Input
													type="password"
													placeholder="Confirm new password"
													className="pr-10"
												/>
												<Button className="gap-2">
													<Lock className="h-4 w-4" />
													Update password
												</Button>
											</div>
										</div>

										<div className="border-t border-border pt-6">
											<label className="block text-sm font-medium mb-2">Two-factor authentication</label>
											<p className="text-sm text-muted-foreground mb-4">
												Add an extra layer of security by requiring a code from an authenticator app.
											</p>
											<Button variant="outline">Enable 2FA</Button>
										</div>

										<div className="border-t border-border pt-6">
											<label className="block text-sm font-medium mb-2">Active sessions</label>
											<p className="text-sm text-muted-foreground mb-4">
												Manage your active login sessions across devices.
											</p>
											<Button variant="outline">View sessions</Button>
										</div>
									</div>
								</div>
							)}

							{/* Notifications Tab */}
							{activeTab === "notifications" && (
								<div className="space-y-6">
									<div>
										<h2 className="text-2xl font-display font-bold mb-1">Notifications</h2>
										<p className="text-muted-foreground">Control how we communicate with you</p>
									</div>

									<div className="rounded-lg border border-border bg-card p-6 space-y-4">
										{[
											{ label: "Email notifications", value: settings.emailNotifications, key: "emailNotifications" as keyof UserSettings },
											{ label: "Weekly digest", value: settings.digests, key: "digests" as keyof UserSettings },
										].map(({ label, value, key }) => (
											<label key={key} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-card/50 cursor-pointer">
												<input
													type="checkbox"
													checked={value}
													onChange={(e) => updateSetting(key, e.target.checked)}
													className="h-4 w-4 rounded border-border accent-accent"
												/>
												<span className="font-medium">{label}</span>
											</label>
										))}
										<Button onClick={saveSettings} disabled={isSaving} className="gap-2 mt-6">
											<Save className="h-4 w-4" />
											{isSaving ? "Saving..." : "Save preferences"}
										</Button>
									</div>
								</div>
							)}

							{/* Documents Tab */}
							{activeTab === "documents" && (
								<div className="space-y-6">
									<div>
										<h2 className="text-2xl font-display font-bold mb-1">Documents</h2>
										<p className="text-muted-foreground">Manage your document workspace</p>
									</div>

									<div className="rounded-lg border border-border bg-card p-6 space-y-4">
										<div>
											<p className="font-medium mb-2">Storage usage</p>
											<div className="space-y-2">
												<div className="flex justify-between text-sm">
													<span className="text-muted-foreground">5.2 GB / 10 GB</span>
													<span className="text-muted-foreground">52%</span>
												</div>
												<div className="h-2 rounded-full bg-muted overflow-hidden">
													<div className="h-full w-1/2 bg-gradient-to-r from-accent to-accent/50" />
												</div>
											</div>
										</div>
										<p className="text-sm text-muted-foreground">
											Upgrade your plan to increase storage limits.
										</p>
									</div>
								</div>
							)}

							{/* AI Preferences Tab */}
							{activeTab === "ai-preferences" && (
								<div className="space-y-6">
									<div>
										<h2 className="text-2xl font-display font-bold mb-1">AI Preferences</h2>
										<p className="text-muted-foreground">Customize how AI responses are generated</p>
									</div>

									<div className="rounded-lg border border-border bg-card p-6 space-y-6">
										{/* Default Model */}
										<div>
											<label className="block text-sm font-medium mb-3">Default model</label>
											<div className="space-y-2">
												{["gpt-4-turbo", "gpt-3.5-turbo", "claude-3"].map((model) => (
													<label key={model} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-card/50 cursor-pointer">
														<input
															type="radio"
															name="model"
															value={model}
															checked={settings.modelDefault === model}
															onChange={(e) => updateSetting("modelDefault", e.target.value)}
															className="h-4 w-4 accent-accent"
														/>
														<span className="font-medium">{model}</span>
													</label>
												))}
											</div>
										</div>

										{/* Response Style */}
										<div className="border-t border-border pt-6">
											<label className="block text-sm font-medium mb-3">Response style</label>
											<div className="grid grid-cols-3 gap-2">
												{(["concise", "balanced", "detailed"] as const).map((style) => (
													<button
														key={style}
														onClick={() => updateSetting("responseStyle", style)}
														className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
															settings.responseStyle === style
																? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
																: "border border-border hover:bg-card"
														}`}
													>
														{style}
													</button>
												))}
											</div>
										</div>

										{/* Citation Display */}
										<div className="border-t border-border pt-6">
											<label className="block text-sm font-medium mb-3">Citation display</label>
											<select
												value={settings.citationDisplay}
												onChange={(e) => updateSetting("citationDisplay", e.target.value as any)}
												className="w-full h-10 rounded-lg border border-border bg-card px-3 text-foreground outline-none focus:ring-2 focus:ring-accent"
											>
												<option value="always">Always show</option>
												<option value="hover">On hover</option>
												<option value="never">Never</option>
											</select>
										</div>

										{/* Auto-Suggest */}
										<div className="border-t border-border pt-6 flex items-center justify-between">
											<div>
												<p className="font-medium">Auto-suggest related questions</p>
												<p className="text-sm text-muted-foreground">Show suggestions after each response</p>
											</div>
											<input
												type="checkbox"
												checked={settings.autoSuggest}
												onChange={(e) => updateSetting("autoSuggest", e.target.checked)}
												className="h-5 w-5 accent-accent"
											/>
										</div>

										<Button onClick={saveSettings} disabled={isSaving} className="gap-2">
											<Save className="h-4 w-4" />
											{isSaving ? "Saving..." : "Save preferences"}
										</Button>
									</div>
								</div>
							)}

							{/* Integrations Tab */}
							{activeTab === "integrations" && (
								<div className="space-y-6">
									<div>
										<h2 className="text-2xl font-display font-bold mb-1">Integrations</h2>
										<p className="text-muted-foreground">Connect external services to ChatRAG</p>
									</div>

									<div className="space-y-4">
										{["Zapier", "Slack", "GitHub", "Microsoft Teams"].map((integration) => (
											<div key={integration} className="rounded-lg border border-border bg-card p-4 flex items-center justify-between">
												<p className="font-medium">{integration}</p>
												<Button variant="outline" size="sm">
													Connect
												</Button>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Plan Tab */}
							{activeTab === "plan" && (
								<div className="space-y-6">
									<div>
										<h2 className="text-2xl font-display font-bold mb-1">Plan & Billing</h2>
										<p className="text-muted-foreground">Manage your subscription and billing</p>
									</div>

									<div className="rounded-lg border border-border bg-card p-6">
										<div className="flex items-center justify-between mb-6">
											<div>
												<p className="text-sm text-muted-foreground">Current plan</p>
												<p className="text-2xl font-bold">Pro Plan</p>
												<p className="text-sm text-muted-foreground mt-1">$19/month</p>
											</div>
											<Button>Upgrade</Button>
										</div>
										<p className="text-sm text-muted-foreground border-t border-border pt-4">
											Next billing date: June 20, 2025
										</p>
									</div>
								</div>
							)}

							{/* Usage Tab */}
							{activeTab === "usage" && (
								<div className="space-y-6">
									<div>
										<h2 className="text-2xl font-display font-bold mb-1">Usage</h2>
										<p className="text-muted-foreground">View your resource usage</p>
									</div>

									<div className="space-y-4">
										{[
											{ label: "Documents", used: 8, limit: 100 },
											{ label: "Storage", used: 5.2, limit: 10, unit: "GB" },
											{ label: "API calls", used: 450, limit: 10000 },
										].map(({ label, used, limit, unit }) => (
											<div key={label} className="rounded-lg border border-border bg-card p-4">
												<div className="flex justify-between mb-2">
													<p className="font-medium">{label}</p>
													<p className="text-sm text-muted-foreground">
														{used} / {limit} {unit || ""}
													</p>
												</div>
												<div className="h-2 rounded-full bg-muted overflow-hidden">
													<div className="h-full bg-gradient-to-r from-accent to-accent/50" style={{ width: `${(used / limit) * 100}%` }} />
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						</motion.div>
					</AnimatePresence>
				</main>
			</div>
		</div>
	);
}
