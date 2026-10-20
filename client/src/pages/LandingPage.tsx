import { Link } from 'react-router-dom';
import { BarChart3, ClipboardList, Gamepad2, Shield, Sparkles, HeartHandshake } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: ClipboardList,
    title: 'AuraAssess',
    text: 'Age-appropriate wellness reflection questionnaires with transparent, personalized results.',
  },
  {
    icon: Sparkles,
    title: 'AURA companion',
    text: 'Supportive AI-guided reflection with safety handling and deterministic fallbacks.',
  },
  {
    icon: Gamepad2,
    title: 'MindPlay',
    text: 'Playable focus, memory, emotion and calm games for every age group.',
  },
  {
    icon: BarChart3,
    title: 'Wellness insights',
    text: 'Mood, sleep, activity and habit trends drawn from your own records.',
  },
  {
    icon: HeartHandshake,
    title: 'Assessment to action',
    text: 'Every check-in suggests practical activities, habits and a seven-day plan.',
  },
  {
    icon: Shield,
    title: 'Privacy first',
    text: 'HTTP-only sessions, consent records, data export and account deletion.',
  },
];

export function LandingPage(): React.JSX.Element {
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <span className="font-semibold">AuraWell AI</span>
          <div className="flex gap-2">
            <Link to="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              Sign in
            </Link>
            <Link to="/register" className={buttonVariants({ size: 'sm' })}>
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16">
        <section className="text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Understand yourself. Build healthy habits. Feel supported.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            AuraWell AI combines wellness assessments, playful practice, mood and lifestyle
            tracking, and a safe AI reflection companion — adapted for children, teens, adults and
            older adults.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/register" className={buttonVariants({ size: 'lg' })}>
              Create a free account
            </Link>
            <Link to="/login" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
              I already have an account
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Educational wellness support only — not a medical device, diagnosis or replacement for
            professional care.
          </p>
        </section>

        <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="mb-2 h-6 w-6 text-primary" aria-hidden="true" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{feature.text}</CardContent>
            </Card>
          ))}
        </section>
      </main>

      <footer className="border-t border-border py-6">
        <p className="mx-auto max-w-6xl px-4 text-center text-xs text-muted-foreground">
          AuraWell AI is a final-year engineering project platform for wellness education. It does
          not diagnose, treat or prevent any medical condition.
        </p>
      </footer>
    </div>
  );
}
