import { motion, useInView, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowRight,
  Upload,
  Cpu,
  MessageSquare,
  Zap,
  Check,
  Star,
  ChevronDown,
  FileText,
} from "lucide-react";
import LiquidEther from "@/components/LiquidEther";
import CustomScrollbar from "@/components/CustomScrollbar";
import { Logo } from "@/components/Logo";

/* ============================================
   1. RAG Pipeline Steps
   ============================================ */
const ragSteps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Documents",
    description:
      "Drop in PDFs, text files, markdown notes, or CSV data. Your files are stored securely in your personal knowledge base — accessible only to you.",
  },
  {
    number: "02",
    icon: Cpu,
    title: "Process & Embed",
    description:
      "Documents are parsed and their content is extracted automatically. The system prepares your knowledge base so every query gets the most relevant context.",
  },
  {
    number: "03",
    icon: MessageSquare,
    title: "Ask Questions",
    description:
      "Type any question in plain language. The RAG engine retrieves the most relevant passages from your documents in real time — no keyword matching required.",
  },
  {
    number: "04",
    icon: Zap,
    title: "Get Grounded Answers",
    description:
      "GPT-4o-mini synthesizes a precise response using your actual documents as context. No hallucinations — every answer is grounded in your data.",
  },
];

/* ============================================
   2. Feature Highlights
   ============================================ */
const features = [
  {
    icon: FileText,
    title: "Multi-Format Support",
    description: "PDF, DOCX, TXT, MD, CSV, and more",
  },
  {
    icon: Zap,
    title: "Real-Time Retrieval",
    description: "Instant semantic search across documents",
  },
  {
    icon: MessageSquare,
    title: "Streaming Responses",
    description: "Watch answers materialize in real time",
  },
  {
    icon: Check,
    title: "Source Citations",
    description: "Every answer backed by referenced documents",
  },
  {
    icon: Cpu,
    title: "AI-Powered",
    description: "Powered by GPT-4o-mini for accuracy",
  },
  {
    icon: Upload,
    title: "Secure & Private",
    description: "Your data stays in your private vault",
  },
];

/* ============================================
   3. Pricing Tiers
   ============================================ */
const pricingTiers = [
  {
    name: "Starter",
    price: "$0",
    period: "Free forever",
    description: "Perfect for personal projects",
    features: [
      "Up to 3 documents",
      "Unlimited questions",
      "Basic search",
      "Email support",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For power users and professionals",
    features: [
      "Unlimited documents",
      "Unlimited questions",
      "Advanced search",
      "Priority support",
      "API access",
      "Custom integrations",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "Contact sales",
    description: "For teams and organizations",
    features: [
      "Everything in Pro",
      "Team management",
      "Advanced security",
      "SLA guarantee",
      "Dedicated support",
      "Custom training",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

/* ============================================
   4. Testimonials
   ============================================ */
const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Manager",
    company: "TechCorp",
    avatar: "SC",
    text: "ChatRAG cut our research time in half. Instead of manually searching through documents, we get instant answers grounded in our actual data.",
  },
  {
    name: "Marcus Johnson",
    role: "Legal Counsel",
    company: "LawFirm LLC",
    avatar: "MJ",
    text: "As a legal professional, accuracy is critical. The source citations are invaluable — I can trace every answer back to the original documents.",
  },
  {
    name: "Emma Rodriguez",
    role: "Data Analyst",
    company: "AnalyticsPlus",
    avatar: "ER",
    text: "The RAG engine is incredibly fast. It's like having a knowledge assistant that never gets tired and always cites its sources.",
  },
];

/* ============================================
   COMPONENTS
   ============================================ */

function StepCard({ step, index }: { step: (typeof ragSteps)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-20% 0px -20% 0px" });
  const Icon = step.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex gap-5 group"
    >
      {/* Left: icon + line */}
      <div className="flex flex-col items-center shrink-0">
        <motion.div
          animate={isInView ? { opacity: 1 } : { opacity: 0.2 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={`w-14 h-14 rounded-xl border flex items-center justify-center transition-all duration-500 ${
            isInView
              ? "bg-accent/10 border-accent/30"
              : "bg-white/[0.02] border-white/8"
          }`}
        >
          <Icon
            className={`h-5 w-5 transition-colors duration-500 ${
              isInView ? "text-accent" : "text-white/15"
            }`}
          />
        </motion.div>
        {index < ragSteps.length - 1 && (
          <div className="w-px flex-1 mt-3 min-h-[40px] bg-white/5 relative overflow-hidden">
            <motion.div
              className="absolute inset-x-0 top-0 bg-gradient-to-b from-accent/40 to-transparent"
              initial={{ height: 0 }}
              animate={isInView ? { height: "100%" } : { height: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
            />
          </div>
        )}
      </div>

      {/* Right: content */}
      <motion.div
        animate={isInView ? { opacity: 1 } : { opacity: 0.2 }}
        transition={{ duration: 0.4 }}
        className={`flex-1 mb-8 rounded-xl px-5 py-4 border transition-all duration-500 ${
          isInView
            ? "bg-white/[0.03] border-white/8"
            : "bg-transparent border-white/4"
        }`}
      >
        <div className="flex items-center gap-3 mb-2">
          <span
            className={`text-xs font-mono font-bold transition-colors duration-500 ${
              isInView ? "text-accent/70" : "text-white/15"
            }`}
          >
            {step.number}
          </span>
          <h3 className="text-sm font-semibold text-white">{step.title}</h3>
        </div>
        <p className="text-sm text-white/40 leading-relaxed">
          {step.description}
        </p>
      </motion.div>
    </motion.div>
  );
}

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative p-6 rounded-xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.05] hover:border-accent/30 transition-all duration-300 cursor-pointer"
    >
      {/* Glow effect on hover */}
      <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur -z-10" />

      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-accent/10 text-accent group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white text-sm mb-1">
            {feature.title}
          </h3>
          <p className="text-xs text-white/40">{feature.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

function PricingCard({
  tier,
  index,
}: {
  tier: (typeof pricingTiers)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative rounded-2xl border transition-all duration-300 p-8 flex flex-col ${
        tier.highlighted
          ? "border-accent/50 bg-gradient-to-br from-accent/10 to-white/[0.02] shadow-[0_0_40px_rgba(108,99,255,0.2)]"
          : "border-white/10 bg-white/[0.02] hover:border-white/20"
      }`}
    >
      {tier.highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-xs font-semibold text-accent">
          Most Popular
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-2">{tier.name}</h3>
        <p className="text-sm text-white/40 mb-6">{tier.description}</p>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-4xl font-bold text-white">{tier.price}</span>
          <span className="text-sm text-white/40">{tier.period}</span>
        </div>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {tier.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-white/70">
            <Check className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        className={`w-full ${
          tier.highlighted
            ? "bg-accent text-white hover:bg-accent/90"
            : "border border-white/20 text-white/70 hover:text-white hover:bg-white/5"
        }`}
        variant={tier.highlighted ? "default" : "outline"}
      >
        {tier.cta}
      </Button>
    </motion.div>
  );
}

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: (typeof testimonials)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="rounded-xl border border-white/10 bg-white/[0.03] p-6 hover:border-accent/20 hover:bg-white/[0.05] transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-sm font-semibold text-accent">
            {testimonial.avatar}
          </div>
          <div>
            <p className="font-semibold text-sm text-white">
              {testimonial.name}
            </p>
            <p className="text-xs text-white/40">
              {testimonial.role} at {testimonial.company}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="h-3.5 w-3.5 fill-accent text-accent"
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-white/60 leading-relaxed">{testimonial.text}</p>
    </motion.div>
  );
}

/* ============================================
   MAIN COMPONENT
   ============================================ */
export default function Landing() {
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const faqs = [
    {
      q: "What file formats do you support?",
      a: "We support PDF, DOCX, TXT, Markdown, CSV, and more. You can upload any text-based document.",
    },
    {
      q: "Is my data secure and private?",
      a: "Yes. Your documents are stored in your private vault and encrypted at rest. Only you can access them.",
    },
    {
      q: "Can I integrate ChatRAG with my tools?",
      a: "Pro and Enterprise users can access our API for custom integrations with Slack, Teams, and more.",
    },
    {
      q: "What if ChatRAG gives wrong answers?",
      a: "All answers include source citations. If something is wrong, you can trace it back to the original document.",
    },
  ];

  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      <CustomScrollbar />

      {/* ============================================
          NAVBAR
          ============================================ */}
      <nav className="sticky top-0 z-40 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="w-6 h-6" />
            <span className="font-semibold text-lg hidden sm:block font-display">
              ChatRAG
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#how-it-works" className="text-white/60 hover:text-white transition-colors">
              How it works
            </a>
            <a href="#features" className="text-white/60 hover:text-white transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-white/60 hover:text-white transition-colors">
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-3">
            <AnimatePresence mode="wait">
              {isAuthenticated ? (
                <motion.div
                  key="authenticated"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-sm text-white/40 hidden sm:inline">
                    {user?.username}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-white/40 hover:text-white"
                  >
                    Sign out
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="unauthenticated"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/login")}
                    className="text-white/60 hover:text-white"
                  >
                    Sign in
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate("/signup")}
                    className="bg-accent text-white hover:bg-accent/90"
                  >
                    Get Started
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated background */}
        <div className="absolute inset-0 z-0">
          <LiquidEther
            colors={["#6C63FF", "#8B5CF6", "#7C3AED"]}
            mouseForce={9}
            cursorSize={150}
            isViscous
            viscous={46}
            iterationsViscous={17}
            iterationsPoisson={32}
            resolution={0.5}
            isBounce
            autoDemo
            autoSpeed={0.15}
            autoIntensity={1.8}
            takeoverDuration={0.25}
            autoResumeDelay={3000}
            autoRampDuration={0.6}
          />
        </div>
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-background via-transparent to-background" />

        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-xs text-accent mb-8 mb-8 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Powered by GPT-4o-mini · Grounded in Your Data
            </div>

            {/* Main headline */}
            <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight leading-[1.05] mb-6">
              Your documents,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent to-purple-400">
                finally answerable.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base md:text-lg text-white/60 leading-relaxed mb-8 max-w-xl mx-auto">
              Upload PDFs, text files, and notes. Ask anything. Get precise
              answers grounded in your own knowledge base — not hallucinations.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10 text-xs text-white/40">
              {[
                "Real-time retrieval",
                "Markdown responses",
                "Per-user privacy",
              ].map((feature, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-accent/60" />
                  {feature}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative min-h-[48px]">
              <AnimatePresence mode="wait">
                {isAuthenticated ? (
                  <motion.div
                    key="authenticated"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button
                      size="lg"
                      onClick={() => navigate("/dashboard")}
                      className="gap-2 px-8 bg-white text-black hover:bg-white/90 font-semibold"
                    >
                      Open Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="unauthenticated"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col sm:flex-row gap-3"
                  >
                    <Button
                      size="lg"
                      onClick={() => navigate("/signup")}
                      className="gap-2 px-8 bg-white text-black hover:bg-white/90 font-semibold"
                    >
                      Get started free
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/login")}
                      className="px-8 border-white/20 text-white/70 hover:text-white hover:bg-white/5"
                    >
                      Sign in
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-xs text-white/30 mt-8">
              No credit card required · Email OTP sign-in
            </p>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-xs text-white/40">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent"
            />
          </motion.div>
        </div>
      </section>

      {/* ============================================
          HOW IT WORKS - RAG PIPELINE
          ============================================ */}
      <section
        id="how-it-works"
        className="py-28 px-6 bg-gradient-to-b from-background to-secondary/50"
      >
        <div className="max-w-3xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/10 text-xs text-accent mb-5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              The RAG Pipeline
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-white mb-4">
              From document to answer
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-400">
                in four steps.
              </span>
            </h2>
            <p className="text-sm text-white/40 max-w-sm mx-auto leading-relaxed">
              The RAG pipeline retrieves relevant context before generating
              responses — grounding every answer in your actual data.
            </p>
          </motion.div>

          {/* Steps */}
          <div>
            {ragSteps.map((step, i) => (
              <StepCard key={step.number} step={step} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURES GRID
          ============================================ */}
      <section id="features" className="py-28 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/10 text-xs text-accent mb-5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              What Makes Us Different
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-white mb-4">
              Built for accuracy and performance
            </h2>
            <p className="text-sm text-white/40 max-w-sm mx-auto">
              Enterprise-grade retrieval with the simplicity of a consumer app.
            </p>
          </motion.div>

          {/* Feature grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FeatureCard key={i} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          PRICING
          ============================================ */}
      <section
        id="pricing"
        className="py-28 px-6 bg-gradient-to-b from-background via-secondary/30 to-background"
      >
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/10 text-xs text-accent mb-5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Simple Pricing
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-white mb-4">
              Pick a plan that works for you
            </h2>
            <p className="text-sm text-white/40 max-w-sm mx-auto">
              Start free. Scale as you grow. No surprises.
            </p>
          </motion.div>

          {/* Pricing grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, i) => (
              <PricingCard key={i} tier={tier} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          TESTIMONIALS
          ============================================ */}
      <section className="py-28 px-6 bg-secondary/40">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/10 text-xs text-accent mb-5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Loved by Users
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-white mb-4">
              Hear from our community
            </h2>
          </motion.div>

          {/* Testimonials grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <TestimonialCard key={i} testimonial={testimonial} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          FAQ
          ============================================ */}
      <section className="py-28 px-6 bg-background">
        <div className="max-w-2xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-white mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>

          {/* FAQ list */}
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.02] hover:border-accent/20 transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-semibold text-white text-sm">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-accent/60 transition-transform duration-300 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-white/5 px-6 py-4 bg-white/[0.02]"
                    >
                      <p className="text-sm text-white/60 leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          FINAL CTA
          ============================================ */}
      <section className="py-28 px-6 border-t border-white/5 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-accent/5 rounded-full blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto relative text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-4 text-white leading-tight">
            Start exploring
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-400">
              your knowledge base.
            </span>
          </h2>

          <p className="text-sm text-white/40 mb-8 max-w-md mx-auto leading-relaxed">
            Sign up in seconds with just your email. Upload your first document
            and ask your first question — no setup required.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {[
              "Free to start",
              "No credit card",
              "Email OTP auth",
              "GPT-4o-mini",
            ].map((pill) => (
              <span
                key={pill}
                className="px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] text-xs text-white/40"
              >
                {pill}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() =>
                navigate(isAuthenticated ? "/chat" : "/signup")
              }
              className="gap-2 px-10 bg-accent text-white hover:bg-accent/90 font-semibold h-11 rounded-xl"
            >
              {isAuthenticated ? "Go to Chat" : "Get started free"}
              <ArrowRight className="h-4 w-4" />
            </Button>
            {!isAuthenticated && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/login")}
                className="px-10 border-white/15 text-white/70 bg-transparent hover:bg-white/5 h-11 rounded-xl"
              >
                Sign in
              </Button>
            )}
          </div>
        </motion.div>
      </section>

      {/* ============================================
          FOOTER
          ============================================ */}
      <footer className="border-t border-white/5 py-12 px-6 bg-secondary/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-8 pb-8 border-b border-white/5">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Logo className="w-4 h-4" />
                <span className="text-sm font-semibold text-white font-display">
                  ChatRAG
                </span>
              </div>
              <p className="text-xs text-white/40">
                Intelligent document retrieval powered by RAG.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-sm text-white mb-4">Product</h4>
              <ul className="space-y-2 text-xs text-white/40">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API Docs
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-white mb-4">Company</h4>
              <ul className="space-y-2 text-xs text-white/40">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-xs text-white/40">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/30">
              © 2025 ChatRAG. All rights reserved.
            </p>
            <p className="text-xs text-white/30">
              Built with React, Vite, and Framer Motion
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
