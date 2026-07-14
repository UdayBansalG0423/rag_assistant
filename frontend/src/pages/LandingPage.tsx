import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  ArrowRight, Check, Star, Twitter, Github, MessageCircle, 
  Lock, Zap, Link as LinkIcon, FolderTree, Search, FileText,
  Menu, X
} from 'lucide-react'
import { Button } from '@/components/ui'
import { Logo } from '@/components/Logo'

export default function LandingPage() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])
  const heroY = useTransform(scrollY, [0, 300], [0, -50])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    { icon: Lock, title: 'Private by Default', desc: 'Your documents never train any model. Isolated per-user vector store.' },
    { icon: Zap, title: 'Instant Retrieval', desc: 'Semantic search returns relevant chunks in <200ms.' },
    { icon: LinkIcon, title: 'Source Citations', desc: 'Every answer links back to the exact page and paragraph.' },
    { icon: FolderTree, title: 'Workspace Folders', desc: 'Organize docs into workspaces. Share with your team.' },
    { icon: Search, title: 'Smart Chunking', desc: 'Intelligent document parsing — tables, headers, figures included.' },
    { icon: FileText, title: 'Multi-format', desc: 'PDF, DOCX, TXT, MD, PPTX, Images (OCR).' },
  ]

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'Free',
      features: ['5 documents', '10MB storage', '1 workspace', 'Community support'],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$19',
      period: '/mo',
      features: ['Unlimited docs', '10GB storage', '5 workspaces', 'Priority support', 'API access'],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: ['Custom limits', 'SSO + SLA', 'On-premise option', 'Dedicated support', 'Custom integrations'],
      cta: 'Contact Sales',
      popular: false,
    },
  ]

  const testimonials = [
    { name: 'Sarah Chen', role: 'CTO', company: 'TechFlow', quote: 'NeuralDoc transformed how our team accesses internal documentation. It\'s like having a knowledgeable colleague available 24/7.' },
    { name: 'Marcus Johnson', role: 'Legal Director', company: 'LawCorp', quote: 'The source citations are a game-changer for legal research. Every answer is verifiable and traceable.' },
    { name: 'Emily Rodriguez', role: 'Research Lead', company: 'BioGen', quote: 'We process hundreds of research papers monthly. NeuralDoc helps us find insights in seconds, not hours.' },
  ]

  const steps = [
    { num: '01', title: 'Upload', desc: 'Drop files (PDF, DOCX, TXT, Images)' },
    { num: '02', title: 'Index', desc: 'AI processes & embeds your documents' },
    { num: '03', title: 'Ask', desc: 'Chat with your docs, get citations' },
  ]

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Navbar */}
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-bg-surface/80 backdrop-blur-xl border-b border-border-subtle shadow-lg' : 'bg-transparent'
      )}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo className="w-12 h-12 shrink-0 text-accent-primary drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
            <div className="flex flex-col leading-tight mt-1">
              <span className="text-2xl font-display font-bold text-white tracking-wide">NeuralDoc</span>
              <span className="text-[10px] font-bold tracking-[0.25em] text-accent-primary">AI-POWERED DOCUMENT ASSISTANT</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Pricing</a>
            <a href="#docs" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Docs</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              Log In
            </button>
            <Button onClick={() => navigate('/signup')} className="flex items-center gap-2">
              Start Free
              <ArrowRight size={16} />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-text-secondary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden bg-bg-surface border-b border-border-subtle"
          >
            <div className="px-6 py-4 space-y-4">
              <a href="#features" className="block text-text-secondary hover:text-text-primary">Features</a>
              <a href="#pricing" className="block text-text-secondary hover:text-text-primary">Pricing</a>
              <a href="#docs" className="block text-text-secondary hover:text-text-primary">Docs</a>
              <div className="flex gap-4 pt-2">
                <button onClick={() => navigate('/login')} className="text-text-secondary">Log In</button>
                <Button onClick={() => navigate('/signup')}>Start Free</Button>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <motion.section 
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(59,130,246,0.12),transparent)]" />
          <div className="absolute inset-0 mask-radial-faded" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '80px 80px'
          }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Floating Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md mb-8 hover:bg-white/[0.05] transition-colors"
          >
            <span className="text-accent-primary">✨</span>
            <span className="text-xs font-medium text-text-secondary tracking-wide">Trusted by 5,000+ teams globally</span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
          >
            Talk to Your Documents.
            <br />
            Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Answers</span>, Not Search Results.
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed font-light"
          >
            Upload any PDF, doc, or file. NeuralDoc indexes it into your private AI knowledge base. 
            Ask questions. Get instant, cited answers — with full source tracing.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" onClick={() => navigate('/signup')} className="flex items-center gap-2 h-12 px-8 text-base shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all">
              Start for Free
              <ArrowRight size={18} />
            </Button>
            <button
              className="flex items-center gap-2 h-12 px-8 rounded-lg text-base font-medium border border-border-default text-text-primary hover:bg-bg-overlay hover:border-border-subtle transition-all"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Features
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Logos Strip */}
      <section className="py-16 border-y border-border-subtle">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-text-muted mb-8">Trusted by teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-40">
            {['TechCorp', 'InnovateCo', 'DataFlow', 'CloudBase', 'NextGen'].map((logo) => (
              <span key={logo} className="text-xl font-display font-bold text-text-secondary hover:opacity-100 transition-opacity cursor-default">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">How It Works</h2>
            <p className="text-text-secondary max-w-xl mx-auto">Three simple steps to transform your documents into an intelligent knowledge base.</p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-20">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center mb-3">
                    <span className="text-2xl font-display font-bold text-accent-primary">{step.num}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary">{step.title}</h3>
                  <p className="text-sm text-text-secondary text-center mt-1">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight size={24} className="text-text-muted hidden md:block" />
                )}
              </div>
            ))}
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-6"
              >
                <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center mb-4">
                  <feature.icon size={20} className="text-accent-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-text-secondary">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-text-secondary">Start free, upgrade when you need more.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  'card p-8 relative',
                  plan.popular && 'border-accent-primary shadow-glow'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent-primary text-white text-xs font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-display font-bold text-text-primary mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-display font-bold text-text-primary">{plan.price}</span>
                  {plan.period && <span className="text-text-muted">{plan.period}</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-text-secondary">
                      <Check size={16} className="text-accent-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  variant={plan.popular ? 'primary' : 'secondary'} 
                  className="w-full"
                  onClick={() => navigate('/signup')}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-bg-surface/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Loved by Teams</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} className="fill-accent-primary text-accent-primary" />
                  ))}
                </div>
                <p className="text-sm text-text-secondary mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center">
                    <span className="text-sm font-semibold text-accent-primary">{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{t.name}</p>
                    <p className="text-xs text-text-muted">{t.role} at {t.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            Ready to Talk to Your Documents?
          </h2>
          <p className="text-lg text-text-secondary mb-10 max-w-xl mx-auto">
            Join thousands of teams using NeuralDoc to unlock the knowledge hidden in their documents.
          </p>
          <Button size="lg" onClick={() => navigate('/signup')} className="flex items-center gap-2 mx-auto">
            Get Started Free
            <ArrowRight size={18} />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <Logo className="w-6 h-6 text-accent-primary" />
                <span className="text-xl font-display font-bold text-white tracking-wide">NeuralDoc</span>
              </div>
              <p className="text-sm text-text-secondary mt-2">Smarter conversations with your documents.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Features</a></li>
                <li><a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Docs</a></li>
                <li><a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">About</a></li>
                <li><a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border-subtle">
            <p className="text-sm text-text-muted">© 2025 NeuralDoc Inc. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <a href="#" className="text-text-muted hover:text-text-primary transition-colors"><Twitter size={18} /></a>
              <a href="#" className="text-text-muted hover:text-text-primary transition-colors"><Github size={18} /></a>
              <a href="#" className="text-text-muted hover:text-text-primary transition-colors"><MessageCircle size={18} /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
