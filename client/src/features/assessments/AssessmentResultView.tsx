import { Link } from 'react-router-dom';
import { CalendarDays, Info, Sparkles, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import type { AssessmentResult } from './types';

const INDICATOR_LABELS: Record<string, string> = {
  emotions: 'Emotions',
  calm: 'Calm & stress',
  sleep: 'Sleep',
  focus: 'Focus',
  movement: 'Movement',
  social: 'Connection',
  digital: 'Digital balance',
  balance: 'Life balance',
  coping: 'Coping tools',
  week: 'This week',
  barrier: 'Getting started',
};

const SUGGESTION_KIND_LABELS: Record<string, string> = {
  game: 'Game',
  habit: 'Habit',
  journal_prompt: 'Journal prompt',
  sleep_routine: 'Sleep routine',
  activity: 'Activity',
  reflection: 'Reflection',
  breathing: 'Breathing',
};

export function AssessmentResultView({
  result,
  onRetake,
}: {
  result: AssessmentResult;
  onRetake?: () => void;
}): React.JSX.Element {
  const indicatorEntries = Object.entries(result.indicators);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your reflection</CardTitle>
          <CardDescription>
            Completed {new Date(result.completedAt).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-relaxed">{result.summary}</p>
          <Alert variant="info" role="status">
            <span className="inline-flex items-center gap-1.5">
              <Info className="h-4 w-4" aria-hidden="true" />
              {result.disclaimer}
            </span>
          </Alert>
        </CardContent>
      </Card>

      {indicatorEntries.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Wellness indicators</CardTitle>
            <CardDescription>
              Self-reported areas, shown as gentle 0–100 reflections — not a clinical score.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {indicatorEntries.map(([domain, value]) => (
              <div key={domain} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{INDICATOR_LABELS[domain] ?? domain}</span>
                  <span className="tabular-nums text-muted-foreground">{value}/100</span>
                </div>
                <div
                  role="meter"
                  aria-valuenow={value}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={INDICATOR_LABELS[domain] ?? domain}
                  className="h-2 overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className={cn(
                      'h-full rounded-full',
                      value >= 70 ? 'bg-success' : value >= 40 ? 'bg-primary' : 'bg-warning',
                    )}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {result.priorities.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <Target className="h-4 w-4" aria-hidden="true" /> Suggested priorities
            </CardTitle>
            <CardDescription>You can turn these into goals on your dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {result.priorities.map((priority) => (
              <Badge key={priority} variant="default">
                {priority}
              </Badge>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {result.suggestions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" aria-hidden="true" /> Suggested next steps
            </CardTitle>
            <CardDescription>Practical actions matched to your answers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.suggestions.map((suggestion) => (
              <div
                key={`${suggestion.kind}:${suggestion.code}`}
                className="rounded-md border border-border p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{suggestion.title}</span>
                  <Badge variant="secondary">
                    {SUGGESTION_KIND_LABELS[suggestion.kind] ?? suggestion.kind}
                  </Badge>
                </div>
                {suggestion.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{suggestion.description}</p>
                ) : null}
                <p className="mt-1 text-xs text-muted-foreground">
                  {suggestion.explanation} · ~{suggestion.estimatedMinutes} min
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {result.sevenDayPlan.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4" aria-hidden="true" /> Your 7-day plan
            </CardTitle>
            <CardDescription>A gentle starting point — adjust it to fit your life.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {result.sevenDayPlan.map((day) => (
                <li key={day.day} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {day.day}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{day.focus}</p>
                    <ul className="mt-0.5 list-inside list-disc text-sm text-muted-foreground">
                      {day.actions.map((action) => (
                        <li key={action}>{action}</li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link to="/assessments" className={cn(buttonVariants({ variant: 'outline' }))}>
          Back to assessments
        </Link>
        <Link to="/dashboard" className={cn(buttonVariants({ variant: 'ghost' }))}>
          Go to dashboard
        </Link>
        {onRetake ? (
          <button type="button" onClick={onRetake} className={cn(buttonVariants({ variant: 'link' }))}>
            Retake this check-in
          </button>
        ) : null}
      </div>
    </div>
  );
}
