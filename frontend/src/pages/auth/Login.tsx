import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { motion } from "framer-motion";
import { Code, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/use-auth";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleEmailLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			await login(email.trim(), password);
			navigate("/dashboard");
		} catch (err: any) {
			setError(err.message || "Unable to sign in");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-background flex">
			{/* Left Panel - Branding */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.6 }}
				className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-card via-card to-secondary flex-col items-center justify-center p-12 relative overflow-hidden"
			>
				<div className="absolute inset-0 opacity-30">
					<div className="absolute top-20 right-20 w-96 h-96 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
					<div className="absolute -bottom-8 left-20 w-96 h-96 bg-accent/50 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
				</div>

				<div className="relative z-10 text-center">
					<div className="mb-8 flex justify-center">
						<Logo className="h-16 w-16 drop-shadow-[0_0_24px_rgba(108,99,255,0.4)]" />
					</div>
					<h1 className="text-5xl font-display font-bold text-foreground mb-4">ChatRAG</h1>
					<p className="text-xl text-muted-foreground mb-12 max-w-sm leading-relaxed">
						Your knowledge, amplified.
					</p>
					<p className="text-sm text-muted-foreground">
						Join 12,000+ teams using ChatRAG to transform documents into instant intelligence.
					</p>
				</div>
			</motion.div>

			{/* Right Panel - Form */}
			<motion.div
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.6, delay: 0.2 }}
				className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12"
			>
				<div className="w-full max-w-md">
					{/* Mobile Logo */}
					<div className="lg:hidden mb-10 flex items-center gap-3">
						<Logo className="h-8 w-8" />
						<span className="text-xl font-display font-bold">ChatRAG</span>
					</div>

					<div className="mb-8">
						<h2 className="text-3xl font-display font-bold text-foreground mb-2">Welcome back</h2>
						<p className="text-muted-foreground">Sign in to access your documents and conversations.</p>
					</div>

					{/* OAuth Buttons */}
					<div className="space-y-3 mb-6">
						<Button
							type="button"
							variant="outline"
							className="w-full h-11 gap-3 bg-card hover:bg-card border-border text-foreground"
						>
							<Globe className="h-4 w-4" />
							Continue with Google
						</Button>
						<Button
							type="button"
							variant="outline"
							className="w-full h-11 gap-3 bg-card hover:bg-card border-border text-foreground"
						>
							<Code className="h-4 w-4" />
							Continue with GitHub
						</Button>
					</div>

					{/* Divider */}
					<div className="relative mb-6">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-border" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
						</div>
					</div>

					{/* Email Form */}
					<form className="space-y-4" onSubmit={handleEmailLogin}>
						{error && (
							<motion.div
								initial={{ opacity: 0, y: -8 }}
								animate={{ opacity: 1, y: 0 }}
								className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive"
							>
								{error}
							</motion.div>
						)}

						<div className="space-y-2">
							<label className="block text-sm font-medium text-foreground">Email address</label>
							<Input
								type="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="h-11 bg-input border-border"
								placeholder="you@example.com"
								disabled={loading}
							/>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<label className="block text-sm font-medium text-foreground">Password</label>
								<a href="#" className="text-xs text-accent hover:text-accent/80 transition-colors">
									Forgot password?
								</a>
							</div>
							<Input
								type="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="h-11 bg-input border-border"
								placeholder="Enter your password"
								disabled={loading}
							/>
						</div>

						<Button
							type="submit"
							disabled={loading}
							className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg shadow-lg shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
						>
							{loading ? "Signing in..." : "Sign in"}
						</Button>
					</form>

					{/* Footer */}
					<p className="mt-8 text-center text-sm text-muted-foreground">
						No account yet?{" "}
						<Link to="/signup" className="text-accent hover:text-accent/80 font-medium transition-colors">
							Create one free
						</Link>
					</p>
				</div>
			</motion.div>
		</div>
	);
}
