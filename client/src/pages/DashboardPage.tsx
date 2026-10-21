import { createElement, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Flame, ThumbsDown, ThumbsUp } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { LoadingState } from '@/components/ui/spinner';
import { useAsync } from '@/hooks/useAsync';
import { useAuthStore } from '@/stores/auth';
import { analyticsService } from '@/features/analytics/analyticsService';
import { WellnessGalaxy } from '@/features/analytics/WellnessGalaxy';
import { MiniBarChart } from '@/features/wellness/MiniBarChart';
import { moodService } from '@/features/wellness/wellnessService';
import {
  iconForKind,
  recommendationService,
  routeForKind,
} from '@/features/recommendations/recommendationService';
import type { Recommendation } from '@/features/recommendations/types';

function greeting(name: string): string {
  const hour = new Date().getHours();
  const part = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return `${part}, ${name.split(' ')[0]}`;
}

export function DashboardPage(): React.JSX.Element {
  const user = useAuthStore((s) => s.user);
  const isChild = user?.ageGroup === 'child';

  const { data, error, loading, reload } = useAsync(async () => {
    const [overview, recommendations, todayMood] = await Promise.all([
      analyticsService.overview(14),
      recommendationService.list({ status: 'suggested', limit: 6 }),
      moodService.today(),
    ]);
    return { overview, recommendations, todayMood };
  }, []);

  if (!user) return <div />;

  const domains = data?.overview.latestAssessment
    ? Object.entries(data.overview.latestAssessment.indicators).map(([key, value]) => ({
        key,
        label: key,
        value,
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{greeting(user.displayName)}</h1>
          <p className="text-sm text-muted-foreground">
            {isChild
              ? 'Welcome to your space. Here are some gentle things to try.'
              : 'A quick look at how things are going, and one step you could take.'}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Flame className="h-4 w-4 text-primary" aria-hidden="true" />
            {user.wellness.streakDays}-day streak
          </span>
          <Badge variant="secondary">Level {user.wellness.level}</Badge>
        </div>
      </div>

      {error ? (
        <Alert variant="error">
          {error.message}{' '}
          <button type="button" className="underline" onClick={reload}>
            Retry
          </button>
        </Alert>
      ) : null}
      {loading ? <LoadingState label="Loading your space…" /> : null}

      {data ? (
        <>
          {data.todayMood.length === 0 ? (
            <Alert variant="info" role="status">
              <span className="flex flex-wrap items-center justify-between gap-2">
                <span>You have not checked in on your mood today.</span>
                <Link to="/mood" className={buttonVariants({ size: 'sm' })}>
                  Log how you feel
                </Link>
              </span>
            </Alert>
          ) : (
            <Alert variant="success" role="status">
              Thanks for checking in today — {data.todayMood.length} mood{' '}
              {data.todayMood.length === 1 ? 'entry' : 'entries'} logged.
            </Alert>
          )}

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">
                  {isChild ? 'Things to try' : 'Suggested for you'}
                </CardTitle>
                <CardDescription>
                  Small, optional steps based on your check-ins. Dismiss anything that is not helpful.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.recommendations.length === 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      No suggestions right now. Complete a check-in to get personalised ideas.
                    </p>
                    <Link to="/assessments" className={buttonVariants({ size: 'sm' })}>
                      Take a check-in
                    </Link>
                  </div>
                ) : (
                  data.recommendations.map((recommendation) => (
                    <RecommendationCard
                      key={recommendation.id}
                      recommendation={recommendation}
                      onChanged={reload}
                    />
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Wellness galaxy</CardTitle>
                <CardDescription>Your self-reported areas from your latest check-in.</CardDescription>
              </CardHeader>
              <CardContent>
                <WellnessGalaxy domains={domains} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Mood this fortnight</CardTitle>
                  <CardDescription>Daily average mood score (1–5).</CardDescription>
                </div>
                <Link to="/analytics" className="text-xs text-primary hover:underline">
                  Insights
                </Link>
              </CardHeader>
              <CardContent>
                <MiniBarChart
                  data={data.overview.mood.trend.map((point) => ({
                    label: point.dayKey.slice(8),
                    value: point.value === null ? null : point.value / 5,
                    caption:
                      point.value === null ? 'No entry' : `${point.dayKey}: ${point.value}`,
                  }))}
                  ariaLabel="Daily average mood over the last 14 days"
                  emptyLabel="Log a mood check-in to see your trend."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Level progress</CardTitle>
                <CardDescription>Gently growing with every check-in.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress
                  value={data.overview.wellness.xpIntoLevel}
                  max={data.overview.wellness.xpForNextLevel}
                  label={`Level ${data.overview.wellness.level}`}
                />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Check-ins</p>
                    <p className="text-lg font-semibold">{data.overview.totals.assessments}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Games played</p>
                    <p className="text-lg font-semibold">{data.overview.totals.gameSessions}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Habit check-ins</p>
                    <p className="text-lg font-semibold">{data.overview.totals.habitCheckIns}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Journal entries</p>
                    <p className="text-lg font-semibold">{data.overview.totals.journalEntries}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            AuraWell AI offers wellness reflection, not medical advice or diagnosis.
          </p>
        </>
      ) : null}
    </div>
  );
}

function RecommendationCard({
  recommendation,
  onChanged,
}: {
  recommendation: Recommendation;
  onChanged: () => void;
}): React.JSX.Element {
  const [busy, setBusy] = useState(false);
  const target = routeForKind(recommendation.kind, recommendation.code);

  async function update(input: { status?: 'completed' | 'dismissed'; feedbackHelpful?: boolean }) {
    setBusy(true);
    try {
      await recommendationService.update(recommendation.id, input);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-md border p-3">
      <div className="flex items-start gap-3">
        <span className="rounded-md bg-primary/10 p-2 text-primary">
          {createElement(iconForKind(recommendation.kind), {
            className: 'h-4 w-4',
            'aria-hidden': true,
          })}
        </span>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium">{recommendation.title}</p>
            <Badge variant="outline">{recommendation.estimatedMinutes} min</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{recommendation.explanation}</p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Link to={target} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Try it
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => void update({ status: 'completed', feedbackHelpful: true })}
            >
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Did it
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              aria-label="Mark helpful"
              onClick={() => void update({ feedbackHelpful: true })}
            >
              <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              aria-label="Dismiss suggestion"
              onClick={() => void update({ status: 'dismissed', feedbackHelpful: false })}
            >
              <ThumbsDown className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
