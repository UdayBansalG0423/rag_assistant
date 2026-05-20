import { ReactNode, useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
	BookOpen,
	LayoutDashboard,
	LogOut,
	Menu,
	MessagesSquare,
	Settings,
	Sparkles,
	UserRound,
	X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/use-auth";

const navigation = [
	{ label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
	{ label: "Knowledge Base", to: "/knowledge-base", icon: BookOpen },
	{ label: "Chat Workspace", to: "/chat", icon: MessagesSquare },
	{ label: "Profile", to: "/profile", icon: UserRound },
	{ label: "Settings", to: "/settings", icon: Settings },
];

export function AppShell({
	title,
	description,
	children,
	actions,
}: {
	title: string;
	description: string;
	children: ReactNode;
	actions?: ReactNode;
}) {
	const navigate = useNavigate();
	const location = useLocation();
	const { user, isAuthenticated, isLoading, signOut } = useAuth();
	const [mobileOpen, setMobileOpen] = useState(false);

	useEffect(() => {
		setMobileOpen(false);
	}, [location.pathname]);

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			navigate("/login", { replace: true });
		}
	}, [isLoading, isAuthenticated, navigate]);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-[#080a0f] flex items-center justify-center text-white/60">
				<div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur">
					<Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
					Loading workspace...
				</div>
			</div>
		);
	}

	if (!isAuthenticated) return null;

	const userLabel = user?.username ?? "workspace";

	return (
		<div className="h-screen w-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.12),_transparent_28%),linear-gradient(180deg,_#080a0f,_#06070b_60%,_#05060a)] text-white">
			<div className="flex h-screen w-full">
				<aside className="hidden lg:flex w-[240px] flex-col border-r border-white/10 bg-black/20 backdrop-blur-xl">
					<div className="px-6 pt-6 pb-5 border-b border-white/10">
						<div className="flex items-center gap-3">
							<Logo className="h-9 w-9 drop-shadow-[0_0_10px_rgba(59,130,246,0.35)]" />
							<div>
								<p className="text-sm font-semibold tracking-wide">NeuralDoc</p>
								<p className="text-xs text-white/40">Knowledge workspace</p>
							</div>
						</div>
					</div>

					<nav className="flex-1 px-3 py-4 space-y-1">
						{navigation.map((item) => {
							const Icon = item.icon;
							return (
								<NavLink
									key={item.to}
									to={item.to}
									className={({ isActive }) =>
										[
											"flex items-center gap-3 rounded-r-xl px-4 py-3 text-sm font-medium transition-all border-l-2",
											isActive
												? "border-blue-500 bg-blue-500/10 text-white"
												: "border-transparent text-white/55 hover:bg-white/5 hover:text-white/85",
										].join(" ")
									}
								>
									<Icon className="h-4 w-4" />
									{item.label}
								</NavLink>
							);
						})}
					</nav>

					<div className="p-4 border-t border-white/10">
						<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
							<p className="text-xs uppercase tracking-[0.24em] text-white/35">Signed in as</p>
							<p className="mt-2 text-sm font-medium text-white/85 truncate">{userLabel}</p>
							<p className="mt-1 text-xs text-white/35">JWT-backed access</p>
							<Button
								variant="ghost"
								className="mt-4 w-full justify-start gap-2 text-white/60 hover:text-white hover:bg-white/5"
								onClick={signOut}
							>
								<LogOut className="h-4 w-4" />
								Sign out
							</Button>
						</div>
					</div>
				</aside>

				<div className="flex min-w-0 flex-1 flex-col">
					<header className="sticky top-0 z-30 border-b border-white/10 bg-[#080a0f]/75 backdrop-blur-xl">
						<div className="flex items-center gap-3 px-4 sm:px-6 py-4">
							<button
								className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70"
								onClick={() => setMobileOpen((current) => !current)}
								aria-label="Toggle navigation"
							>
								{mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
							</button>

							<div className="min-w-0 flex-1">
								<p className="text-xs uppercase tracking-[0.28em] text-white/35">Workspace</p>
								<h1 className="truncate text-lg font-semibold text-white">{title}</h1>
							</div>

							<div className="hidden md:flex items-center gap-3">
								{actions}
								<div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70">
									{userLabel}
								</div>
							</div>
						</div>
						<div className="px-4 sm:px-6 pb-4 text-sm text-white/45">{description}</div>
					</header>

					<main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 pb-24 lg:pb-6 relative flex flex-col min-h-0">
						{children}
					</main>
				</div>
			</div>

			<AnimatePresence>
				{mobileOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-40 bg-black/60 lg:hidden"
						onClick={() => setMobileOpen(false)}
					>
						<motion.aside
							initial={{ x: -320 }}
							animate={{ x: 0 }}
							exit={{ x: -320 }}
							transition={{ type: "spring", stiffness: 300, damping: 32 }}
							className="h-full w-[84vw] max-w-sm border-r border-white/10 bg-[#0b0d14] p-4 shadow-2xl"
							onClick={(event) => event.stopPropagation()}
						>
							<div className="flex items-center gap-3 border-b border-white/10 pb-4">
								<Logo className="h-8 w-8" />
								<div>
									<p className="font-semibold">NeuralDoc</p>
									<p className="text-xs text-white/40">Knowledge workspace</p>
								</div>
							</div>

							<nav className="mt-4 space-y-1">
								{navigation.map((item) => {
									const Icon = item.icon;
									return (
										<NavLink
											key={item.to}
											to={item.to}
											className={({ isActive }) =>
												[
													"flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium",
													isActive ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/5",
												].join(" ")
											}
										>
											<Icon className="h-4 w-4" />
											{item.label}
										</NavLink>
									);
								})}
							</nav>

							<Button className="mt-6 w-full justify-center gap-2" variant="outline" onClick={signOut}>
								<LogOut className="h-4 w-4" />
								Sign out
							</Button>
						</motion.aside>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

