import { Link } from 'react-router-dom';
import { Clock, ListChecks, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import type { AssessmentCategory, AssessmentSummary } from './types';

export const CATEGORY_LABELS: Record<AssessmentCategory, string> = {
  emotional: 'Emotional wellness',
  sleep: 'Sleep',
  focus: 'Focus',
  habits: 'Habits',
  activity: 'Activity',
  social: 'Connection',
  digital: 'Digital wellbeing',
  strengths: 'Strengths',
  lifestyle: 'Lifestyle',
  reflection: 'Reflection',
  'daily-mood': 'Daily Mood & Emotions',
  'stress-pressure': 'Stress & Pressure',
  'anxiety-worry': 'Anxiety & Worry',
  'sleep-rest': 'Sleep & Rest',
  'emotional-wellbeing': 'Emotional Wellbeing',
  'self-esteem': 'Self-Esteem & Confidence',
  'burnout-exhaustion': 'Burnout & Exhaustion',
  'focus-concentration': 'Focus & Concentration',
  'social-connection': 'Social Connection',
  'motivation-productivity': 'Motivation & Productivity',
  'anger-frustration': 'Anger & Frustration',
  'resilience-coping': 'Resilience & Coping',
  'gratitude-positive': 'Gratitude & Glimmers',
  'lifestyle-digital': 'Lifestyle & Digital',
  'weekly-review': 'Weekly Wellness Review',
};

export const CATEGORY_COLORS: Partial<Record<AssessmentCategory, string>> = {
  'daily-mood': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'stress-pressure': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'anxiety-worry': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'sleep-rest': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'emotional-wellbeing': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'self-esteem': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'burnout-exhaustion': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'focus-concentration': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'social-connection': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'motivation-productivity': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'anger-frustration': 'bg-red-500/10 text-red-400 border-red-500/20',
  'resilience-coping': 'bg-lime-500/10 text-lime-400 border-lime-500/20',
  'gratitude-positive': 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
  'lifestyle-digital': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'weekly-review': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
};

export function AssessmentCard({
  assessment,
}: {
  assessment: AssessmentSummary;
}): React.JSX.Element {
  const badgeStyle = CATEGORY_COLORS[assessment.category] ?? 'bg-muted text-muted-foreground';

  return (
    <Card className="group flex h-full flex-col transition-all duration-200 hover:border-primary/40 hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base group-hover:text-primary transition-colors">
            {assessment.title}
          </CardTitle>
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
              badgeStyle,
            )}
          >
            {CATEGORY_LABELS[assessment.category] ?? assessment.category}
          </span>
        </div>
        <CardDescription className="line-clamp-2">{assessment.description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />~{assessment.estimatedMinutes} min
            </span>
            <span className="inline-flex items-center gap-1">
              <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
              {assessment.questionCount} questions
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/80">
            <Sparkles className="h-3 w-3 text-primary/70" />
            Quick · Standard · Detailed
          </span>
        </div>
        <Link
          to={`/assessments/${assessment.code}`}
          state={{ title: assessment.title }}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'w-full group-hover:border-primary/50 group-hover:bg-primary/5 transition-all',
          )}
        >
          Start check-in
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  );
}
