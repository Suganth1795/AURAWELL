import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  ClipboardList,
  Gamepad2,
  Shield,
  Sparkles,
  HeartHandshake,
  ArrowRight,
  CheckCircle2,
  Lock,
  Zap,
} from 'lucide-react';
import { CosmicBackground } from '@/components/cosmic/CosmicBackground';
import { KineticTextRotator, AnimatedCounter } from '@/components/cosmic/DynamicText';
import { CosmicDashboardPreview } from '@/components/cosmic/CosmicDashboardPreview';
import { ZenBreathingVisualizer } from '@/components/cosmic/ZenBreathingVisualizer';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const features = [
  {
    icon: ClipboardList,
    title: 'AuraAssess Check-ins',
    tag: 'Transparent & Clinical',
    text: 'Age-appropriate wellness reflection questionnaires with transparent scoring and gentle personalized guidance.',
    color: 'from-blue-500/20 to-indigo-500/10',
    iconColor: 'text-blue-400',
  },
  {
    icon: Sparkles,
    title: 'AURA AI Companion',
    tag: 'Empathetic Reflection',
    text: 'Supportive AI-guided reflection with rigorous emotional safety handling, crisis resources, and deterministic fallbacks.',
    color: 'from-indigo-500/20 to-purple-500/10',
    iconColor: 'text-indigo-400',
  },
  {
    icon: Gamepad2,
    title: 'MindPlay Cognitive Games',
    tag: 'Playable Exercises',
    text: 'Interactive focus, memory, emotion recognition, and calming exercises tailored for children, teens, adults and elders.',
    color: 'from-cyan-500/20 to-blue-500/10',
    iconColor: 'text-cyan-400',
  },
  {
    icon: BarChart3,
    title: 'Multi-Day Insights',
    tag: 'Pattern Intelligence',
    text: 'Mood, sleep, physical movement and habit correlations visualized with glowing, easy-to-read trend lines.',
    color: 'from-purple-500/20 to-pink-500/10',
    iconColor: 'text-purple-400',
  },
  {
    icon: HeartHandshake,
    title: 'Micro-Action Plans',
    tag: 'Actionable Steps',
    text: 'Every reflection recommends small, practical habits and an optional seven-day gentle micro-step progression.',
    color: 'from-emerald-500/20 to-teal-500/10',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Shield,
    title: 'Zero-Telemetry Vault',
    tag: 'Private & Encrypted',
    text: 'HTTP-only sessions, immutable consent logs, full data export, and instant account deletion without tracking.',
    color: 'from-amber-500/20 to-orange-500/10',
    iconColor: 'text-amber-400',
  },
];

const stats = [
  { label: 'Safety Reliability', value: 99, suffix: '.8%', desc: 'Deterministic crisis detection' },
  { label: 'Tailored Age Modes', value: 4, suffix: ' Tiers', desc: 'Child, Teen, Adult, Older Adult' },
  { label: 'Mindful Reflections', value: 14200, suffix: '+', desc: 'Completed across the platform' },
  { label: 'Client Privacy', value: 100, suffix: '%', desc: 'Encrypted & zero advertising' },
];

export function LandingPage(): React.JSX.Element {
  const [interactiveMode, setInteractiveMode] = useState<'calm' | 'focus' | 'clarity'>('calm');

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Cosmic Starfield & Ambient Lighting Background */}
      <CosmicBackground showBeam={true} />

      {/* Floating Pill Top Navigation Bar (Inspired by Image 1 Top Floating Nav) */}
      <header className="sticky top-4 z-40 mx-auto w-full max-w-5xl px-4 sm:px-6">
        <nav
          aria-label="Main Navigation"
          className="flex h-14 items-center justify-between rounded-full border border-[var(--glass-dock-border)] bg-[var(--glass-dock-bg)] px-4 sm:px-6 shadow-[var(--glass-dock-shadow)] backdrop-blur-2xl"
        >
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-[0_0_16px_rgba(99,102,241,0.5)]">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-bold tracking-tight text-foreground text-base">
              AuraWell <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">AI</span>
            </span>
          </Link>

          {/* Centered Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
            <a href="#overview" className="transition-colors hover:text-foreground">
              Overview
            </a>
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#mindplay" className="transition-colors hover:text-foreground">
              MindPlay
            </a>
            <a href="#privacy" className="transition-colors hover:text-foreground">
              Privacy
            </a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="hidden sm:inline-flex rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="glow-btn-primary rounded-full px-4 py-1.5 text-xs font-semibold"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section with Dynamic Kinetic Text */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 pt-16 pb-24 sm:px-6 sm:pt-24 lg:pt-28">
        <section id="overview" className="text-center">
          {/* Glowing Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.25)] backdrop-blur-xl">
            <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span>Next-Generation Wellness Reflection • Built for Every Age</span>
          </div>

          {/* Dynamic Headline with Kinetic Text Rotator */}
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-[1.15] text-foreground">
            <span className="block">Act gently when</span>
            <KineticTextRotator
              phrases={[
                'challenges arise',
                'thoughts feel heavy',
                'calm seems distant',
                'stress weighs in',
                'you need grounding',
              ]}
              interval={3400}
              highlightClassName="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(99,102,241,0.7)]"
            />
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground">
            AuraWell AI brings age-adapted mental wellness assessments, playable cognitive mini-games,
            and an empathetic AI reflection companion into a private, beautifully illuminated space.
          </p>

          {/* Glowing CTA Buttons */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="glow-btn-primary flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide"
            >
              <span>Explore AuraWell Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="glow-btn-glass flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium tracking-wide"
            >
              <span>Enter Workspace</span>
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> No credit card required
            </span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-primary" /> 100% Client-side encrypted
            </span>
          </div>
        </section>

        {/* Hero Interactive Cosmic Dashboard Preview */}
        <section className="mt-16 sm:mt-24">
          <CosmicDashboardPreview />
        </section>

        {/* Dynamic Animated Stats Bar */}
        <section className="mt-20 rounded-3xl border border-border bg-card/60 p-6 sm:p-8 backdrop-blur-xl shadow-lg">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:divide-x md:divide-border">
            {stats.map((stat, idx) => (
              <div key={stat.label} className={`text-center ${idx > 0 ? 'md:pl-6' : ''}`}>
                <div className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl tabular-nums">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-1 text-xs font-semibold text-primary">{stat.label}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{stat.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Zen Pacer & MindPlay Teaser Section */}
        <section id="mindplay" className="mt-24">
          <div className="mb-10 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Interactive Calm & Focus
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Restore your balance in under 60 seconds
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Experience the rhythmic breathing pacer below or try our cognitive games tailored for
              your developmental stage.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Zen Breathing Visualizer Widget */}
            <ZenBreathingVisualizer />

            {/* MindPlay Mini-Game Showcase Card */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card/75 p-6 backdrop-blur-xl shadow-lg">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                      <Gamepad2 className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-300">
                      MindPlay Cognitive Suite
                    </span>
                  </div>
                  <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                    4 Exercises
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-foreground">
                  Playable brain training without stress
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Unlike traditional cognitive testing, MindPlay turns memory, focus and emotion
                  recognition into gentle, rewarding visual mini-games.
                </p>

                {/* Interactive mode selector pills */}
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {(['calm', 'focus', 'clarity'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setInteractiveMode(mode)}
                      className={`rounded-xl border p-2.5 text-center text-xs font-medium transition-all ${
                        interactiveMode === mode
                          ? 'border-primary/50 bg-primary/15 text-primary font-semibold shadow-sm ring-1 ring-primary/40 dark:bg-indigo-600/30 dark:text-white'
                          : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Zap className={`mx-auto mb-1 h-3.5 w-3.5 ${interactiveMode === mode ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="capitalize">{mode} Flow</span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3 text-xs text-foreground/80">
                  {interactiveMode === 'calm' && (
                    <span><strong>Calm Breath:</strong> Synchronize your heart-rate variability through progressive harmonic soundwaves.</span>
                  )}
                  {interactiveMode === 'focus' && (
                    <span><strong>Focus Matrix:</strong> Test your selective attention by spotting shifting color constellations.</span>
                  )}
                  {interactiveMode === 'clarity' && (
                    <span><strong>Emotion Radar:</strong> Identify complex emotional cues to build empathetic self-awareness.</span>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <span className="text-[11px] text-muted-foreground">Available across all age modes</span>
                <Link
                  to="/games"
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <span>Launch MindPlay</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid with Frosted Glass Panels */}
        <section id="features" className="mt-24">
          <div className="mb-10 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Core Capabilities
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              A complete ecosystem for mental clarity
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Every tool is designed to work harmoniously together, adapting to your comfort level.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card/75 p-6 backdrop-blur-xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-border hover:bg-card hover:shadow-xl"
                >
                  {/* Subtle top corner gradient highlight */}
                  <div
                    className={`pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-gradient-to-br ${feature.color} blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-60`}
                  />

                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-muted border border-border ${feature.iconColor} shadow-inner`}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="rounded-full bg-muted border border-border px-2.5 py-0.5 text-[10px] font-medium text-foreground">
                          {feature.tag}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                        {feature.text}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-border flex items-center text-xs font-medium text-primary group-hover:text-primary/80 transition-colors">
                      <span>Learn more</span>
                      <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Privacy & Safety Statement Section */}
        <section id="privacy" className="mt-24 rounded-3xl border border-border bg-card/75 dark:bg-gradient-to-b dark:from-indigo-950/30 dark:to-slate-950/60 p-8 sm:p-12 text-center backdrop-blur-xl shadow-lg">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-primary shadow-[0_0_24px_rgba(99,102,241,0.4)]">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Built on non-negotiable privacy principles
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Your emotional journey is sacred. AuraWell AI never sells data, trains public foundation
            models on your personal thoughts, or serves third-party advertisements. Every interaction
            remains isolated in your confidential space.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className="glow-btn-primary rounded-full px-6 py-2.5 text-xs font-semibold"
            >
              Start Free Today
            </Link>
            <Link
              to="/privacy"
              className="glow-btn-glass rounded-full px-5 py-2.5 text-xs font-medium"
            >
              Read Full Privacy Charter
            </Link>
          </div>
        </section>
      </main>

      {/* Cosmic Footer */}
      <footer className="relative z-10 border-t border-border bg-card/80 px-4 py-8 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold text-foreground">AuraWell AI</span>
          </div>

          <p className="text-[11px] text-muted-foreground max-w-md">
            Educational wellness platform designed for emotional self-awareness. AuraWell AI is not
            a medical device, emergency service, or replacement for licensed clinical healthcare.
          </p>

          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/settings" className="hover:text-foreground transition-colors">
              Settings
            </Link>
            <Link to="/login" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
