'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { ArrowRight, FileText, Zap, Shield, BarChart3, Clock, Users, Star, ChevronRight } from 'lucide-react'
import Logo from '@/components/Logo'

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const stats = [
  { value: '10,000+', label: 'Reports Generated' },
  { value: '2,500+', label: 'Agencies Trust Us' },
  { value: '< 30s', label: 'Average Generation' },
  { value: '99.9%', label: 'Uptime' },
]

const features = [
  {
    icon: FileText,
    title: 'Upload CSV Data',
    description: 'Simply export your campaign data from Google Ads or Meta Ads and drop the CSV into ReportFlow.',
  },
  {
    icon: Zap,
    title: 'AI-Powered Analysis',
    description: 'Claude AI analyzes every metric, identifies trends, and writes professional narrative insights.',
  },
  {
    icon: Shield,
    title: 'Export Branded PDF',
    description: 'Download beautifully formatted, white-labeled PDF reports ready to send to your clients.',
  },
  {
    icon: BarChart3,
    title: 'Performance Metrics',
    description: 'Automatic KPI tracking with clear visualizations of impressions, clicks, conversions, and ROI.',
  },
  {
    icon: Clock,
    title: 'Save Hours Weekly',
    description: 'What used to take hours of manual work now takes seconds. Focus on strategy, not formatting.',
  },
  {
    icon: Users,
    title: 'Built for Agencies',
    description: 'Multi-client management, custom branding, and team collaboration designed for agency workflows.',
  },
]

const testimonials = [
  {
    quote: "ReportFlow AI cut our reporting time from 4 hours to 30 seconds per client. Game-changing.",
    author: "Sarah Chen",
    role: "Director of Paid Media",
    company: "GrowthLab Agency",
  },
  {
    quote: "Our clients think we hired a full-time analyst. The AI-generated insights are incredibly detailed.",
    author: "Marcus Rodriguez",
    role: "Founder & CEO",
    company: "Apex Digital",
  },
  {
    quote: "The PDF reports look so professional, clients started asking how much extra we charge for them.",
    author: "Emily Park",
    role: "Account Manager",
    company: "NorthStar Marketing",
  },
]

export default function LandingPage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -60])

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-black/60 backdrop-blur-2xl"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo href="/" size="md" />
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-white/60 hover:text-white transition-all duration-300 px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-white text-black px-5 py-2 rounded-full font-medium hover:bg-white/90 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute inset-0 radial-fade" />

        {/* Floating orb decorations */}
        <div className="absolute top-40 left-1/4 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-60 right-1/4 w-[400px] h-[400px] bg-white/[0.015] rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs text-white/50 mb-8 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Powered by Claude AI
            <ChevronRight className="w-3 h-3 text-white/30" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-[1.05] mb-6"
          >
            Turn Ad Data Into
            <br />
            <span className="gradient-text">Client Reports</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Upload your Google Ads or Meta Ads CSV. Get a professional,
            AI-written performance report in seconds — not hours.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/signup"
              className="group flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-full font-medium hover:bg-white/90 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-[1.02]"
            >
              Start Free
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="#how-it-works"
              className="text-white/50 hover:text-white transition-all duration-300 px-6 py-3.5 rounded-full border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.03]"
            >
              See How It Works
            </Link>
          </motion.div>

          {/* Hero visual - floating report mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9, ease: [0.25, 0.1, 0, 1] }}
            className="mt-20 mx-auto max-w-3xl"
          >
            <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-1 glow-white animate-float">
              <div className="rounded-xl bg-gradient-to-b from-white/[0.04] to-transparent p-8 space-y-4">
                {/* Fake report header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10" />
                    <div>
                      <div className="h-3 w-32 bg-white/20 rounded-full" />
                      <div className="h-2 w-20 bg-white/10 rounded-full mt-1.5" />
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-xs text-emerald-400">Completed</span>
                  </div>
                </div>
                {/* Fake chart bars */}
                <div className="flex items-end gap-2 h-24 pt-4">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 0.8, delay: 1.2 + i * 0.05, ease: 'easeOut' }}
                      className="flex-1 bg-white/[0.08] rounded-sm hover:bg-white/[0.15] transition-colors"
                    />
                  ))}
                </div>
                {/* Fake text lines */}
                <div className="space-y-2 pt-2">
                  <div className="h-2 w-full bg-white/[0.06] rounded-full" />
                  <div className="h-2 w-4/5 bg-white/[0.04] rounded-full" />
                  <div className="h-2 w-3/5 bg-white/[0.03] rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-16 px-6 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <AnimatedSection key={stat.label}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="text-center"
                >
                  <p className="text-3xl md:text-4xl font-semibold text-white mb-1">{stat.value}</p>
                  <p className="text-sm text-white/40">{stat.label}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 border-t border-white/[0.06] relative">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="max-w-6xl mx-auto relative z-10">
          <AnimatedSection className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-white/30 mb-4">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Three steps to professional reports
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Upload Your Data', desc: 'Export your campaign CSV from Google Ads or Meta Ads Manager and drag it into ReportFlow.', icon: FileText },
              { step: '02', title: 'AI Generates Report', desc: 'Claude AI analyzes every metric, identifies key trends, and writes professional insights.', icon: Zap },
              { step: '03', title: 'Download & Send', desc: 'Get a branded PDF report ready to share with your client. Professional and polished.', icon: Shield },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: [0.25, 0.1, 0, 1] }}
                className="group relative p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 hover:border-white/[0.12]"
              >
                <div className="absolute top-6 right-6 text-5xl font-bold text-white/[0.04] group-hover:text-white/[0.06] transition-colors">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mb-5 group-hover:bg-white/[0.08] transition-all duration-500">
                  <item.icon className="w-5 h-5 text-white/60" />
                </div>
                <h3 className="text-lg font-medium mb-2">{item.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-white/30 mb-4">Features</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Everything you need for<br />client reporting
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-500"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mb-4 group-hover:bg-white/[0.08] transition-all duration-500">
                  <feature.icon className="w-5 h-5 text-white/60" />
                </div>
                <h3 className="font-medium mb-2">{feature.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 border-t border-white/[0.06] relative">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="max-w-6xl mx-auto relative z-10">
          <AnimatedSection className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-white/30 mb-4">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Trusted by leading agencies
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-white/20 text-white/20" />
                  ))}
                </div>
                <p className="text-sm text-white/60 leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium text-white/50">
                    {t.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">{t.author}</p>
                    <p className="text-xs text-white/30">{t.role}, {t.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-white/30 mb-4">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-white/40 max-w-lg mx-auto">Start free. Upgrade when you&apos;re ready. No hidden fees, no surprises.</p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] transition-all duration-500"
            >
              <h3 className="font-medium mb-1 text-white/80">Free</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-semibold">$0</span>
                <span className="text-white/30">/month</span>
              </div>
              <ul className="space-y-3 text-sm text-white/50 mb-8">
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/[0.05] flex items-center justify-center"><ChevronRight className="w-3 h-3 text-white/40" /></div>
                  3 reports per month
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/[0.05] flex items-center justify-center"><ChevronRight className="w-3 h-3 text-white/40" /></div>
                  Google & Meta Ads support
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/[0.05] flex items-center justify-center"><ChevronRight className="w-3 h-3 text-white/40" /></div>
                  PDF export
                </li>
              </ul>
              <Link
                href="/signup"
                className="block text-center py-3 rounded-full border border-white/[0.1] font-medium hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300"
              >
                Get Started
              </Link>
            </motion.div>

            {/* Pro */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="p-8 rounded-2xl border border-white/[0.12] bg-white/[0.04] relative overflow-hidden hover:border-white/20 transition-all duration-500 glow-white-sm"
            >
              <div className="absolute top-4 right-4 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full bg-white/[0.08] border border-white/[0.1] text-white/60">
                Popular
              </div>
              <h3 className="font-medium mb-1 text-white/80">Pro</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-semibold">$49</span>
                <span className="text-white/30">/month</span>
              </div>
              <ul className="space-y-3 text-sm text-white/50 mb-8">
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/[0.08] flex items-center justify-center"><ChevronRight className="w-3 h-3 text-white/50" /></div>
                  Unlimited reports
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/[0.08] flex items-center justify-center"><ChevronRight className="w-3 h-3 text-white/50" /></div>
                  Custom branding
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/[0.08] flex items-center justify-center"><ChevronRight className="w-3 h-3 text-white/50" /></div>
                  Priority support
                </li>
              </ul>
              <Link
                href="/signup"
                className="block text-center py-3 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              >
                Upgrade to Pro
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/[0.06] relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[150px] pointer-events-none" />

        <AnimatedSection className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Ready to save hours on reporting?
          </h2>
          <p className="text-white/40 mb-10 text-lg">
            Join thousands of agencies using AI to create professional reports in seconds.
          </p>
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-full font-medium hover:bg-white/90 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-[1.02]"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <p className="mt-4 text-xs text-white/20">No credit card required</p>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <Logo size="sm" />
            <span className="text-xs text-white/20">&copy; 2026 ReportFlow AI. All rights reserved.</span>
          </div>
          <div className="flex gap-8 text-sm text-white/30">
            <a href="#" className="hover:text-white/60 transition-colors duration-300">Privacy</a>
            <a href="#" className="hover:text-white/60 transition-colors duration-300">Terms</a>
            <a href="#" className="hover:text-white/60 transition-colors duration-300">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
