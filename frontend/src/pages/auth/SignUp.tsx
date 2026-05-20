import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { motion } from "framer-motion";
import { Code, Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/use-auth";

export default function SignUp() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMsg, setSuccessMsg] = useState<string | null>(null);
	const navigate = useNavigate();
	const { register } = useAuth();

	const passwordStrength = {
		weak: password.length < 8,
		medium: password.length >= 8 && password.length < 12,
		strong: password.length >= 12,
	};

	const handleEmailSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccessMsg(null);

		try {
			await register(name.trim(), email.trim(), password);
			setSuccessMsg("Account created! Check your email to verify, then sign in.");
			setTimeout(() => navigate("/login"), 2500);
		} catch (err: any) {
			setError(err.message || "Unable to sign up");
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
						<h2 className="text-3xl font-display font-bold text-foreground mb-2">Create an account</h2>
						<p className="text-muted-foreground">Sign up to start transforming your documents with AI.</p>
					</div>

					{/* OAuth Buttons */}
					<div className="space-y-3 mb-6">
						<Button
							type="button"
							variant="outline"
							className="w-full h-11 gap-3 bg-card hover:bg-card border-border text-foreground"
						>
							<Globe className="h-4 w-4" />
							Sign up with Google
						</Button>
						<Button
							type="button"
							variant="outline"
							className="w-full h-11 gap-3 bg-card hover:bg-card border-border text-foreground"
						>
							<Code className="h-4 w-4" />
							Sign up with GitHub
						</Button>
					</div>

					{/* Divider */}
					<div className="relative mb-6">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-border" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">Or sign up with email</span>
						</div>
					</div>

					{/* Email Form */}
					<form className="space-y-4" onSubmit={handleEmailSignUp}>
						{error && (
							<motion.div
								initial={{ opacity: 0, y: -8 }}
								animate={{ opacity: 1, y: 0 }}
								className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive"
							>
								{error}
							</motion.div>
						)}

						{successMsg && (
							<motion.div
								initial={{ opacity: 0, y: -8 }}
								animate={{ opacity: 1, y: 0 }}
								className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400 flex items-center gap-2"
							>
								<Check className="h-4 w-4" />
								{successMsg}
							</motion.div>
						)}

						<div className="space-y-2">
							<label className="block text-sm font-medium text-foreground">Full name</label>
							<Input
								type="text"
								required
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="h-11 bg-input border-border"
								placeholder="Your name"
								disabled={loading}
							/>
						</div>

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
							<label className="block text-sm font-medium text-foreground">Password</label>
							<Input
								type="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								minLength={6}
								className="h-11 bg-input border-border"
								placeholder="Create a strong password"
								disabled={loading}
							/>
							<div className="flex gap-2 mt-2">
								<div className={`flex-1 h-1 rounded-full transition-colors ${passwordStrength.weak ? "bg-destructive" : password ? "bg-yellow-500/50" : "bg-border"}`} />
								<div className={`flex-1 h-1 rounded-full transition-colors ${passwordStrength.strong ? "bg-green-500/50" : password ? "bg-yellow-500/50" : "bg-border"}`} />
								<div className={`flex-1 h-1 rounded-full transition-colors ${passwordStrength.strong ? "bg-green-500" : "bg-border"}`} />
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								{!password ? "Create a password" : passwordStrength.weak ? "Weak password" : passwordStrength.medium ? "Medium strength" : "Strong password"}
							</p>
						</div>

						<Button
							type="submit"
							disabled={loading}
							className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg shadow-lg shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
						>
							{loading ? "Creating account..." : "Create account"}
						</Button>
					</form>

					{/* Footer */}
					<p className="mt-8 text-center text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link to="/login" className="text-accent hover:text-accent/80 font-medium transition-colors">
							Sign in
						</Link>
					</p>

					<p className="mt-6 text-xs text-muted-foreground text-center">
						By signing up, you agree to our Terms of Service and Privacy Policy.
					</p>
				</div>
			</motion.div>
		</div>
	);
}

