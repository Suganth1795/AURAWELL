import { createElement, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Flame, ThumbsDown, ThumbsUp, Music, Play } from 'lucide-react';
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
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { useAsync } from '@/hooks/useAsync';
import { useAuthStore } from '@/stores/auth';
import { analyticsService } from '@/features/analytics/analyticsService';
import { WellnessGalaxy } from '@/features/analytics/WellnessGalaxy';
import { MiniBarChart } from '@/features/wellness/MiniBarChart';
import { moodService } from '@/features/wellness/wellnessService';
import { musicCatalog } from '@/features/music/musicCatalog';
import { useMusicStore } from '@/features/music/musicStore';
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
      <PageHeader
        title={greeting(user.displayName)}
        description={
          isChild
            ? 'Welcome to your space. Here are some gentle things to try.'
            : 'A quick look at how things are going, and one step you could take.'
        }
        actions={
          <>
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <Flame className="h-4 w-4 text-primary" aria-hidden="true" />
              {user.wellness.streakDays}-day streak
            </span>
            <Badge variant="secondary">Level {user.wellness.level}</Badge>
          </>
        }
      />

      {error ? (
        <Alert variant="error">
          <span className="flex flex-wrap items-center justify-between gap-2">
            <span>{error.message}</span>
            <Button variant="outline" size="sm" onClick={reload}>
              Retry
            </Button>
          </span>
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
                  <EmptyState
                    title="No suggestions right now"
                    description="Complete a check-in to get personalised ideas."
                    action={
                      <Link to="/assessments" className={buttonVariants({ size: 'sm' })}>
                        Take a check-in
                      </Link>
                    }
                  />
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

          {/* Peaceful Soundscapes Quick Launcher */}
          <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-primary">
                  <Music className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Peaceful Soundscapes</h3>
                  <p className="text-xs text-muted-foreground">Relax with authentic nature sounds and ambient music.</p>
                </div>
              </div>
              <Link to="/music" className="text-xs font-medium text-primary hover:underline">
                Explore all 19 sounds &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {musicCatalog.slice(0, 3).map((track) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => useMusicStore.getState().playTrack(track, musicCatalog)}
                  className="group flex items-center justify-between rounded-xl border border-border/60 bg-muted/40 p-3 text-left transition-all hover:bg-muted/80 hover:border-border cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-semibold text-foreground truncate group-hover:text-primary">
                      {track.title}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">{track.mood}</div>
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                  </span>
                </button>
              ))}
            </div>
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
                  <div className="rounded-xl border border-border bg-card/60 p-3">
                    <p className="text-xs text-muted-foreground">Check-ins</p>
                    <p className="text-lg font-semibold">{data.overview.totals.assessments}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card/60 p-3">
                    <p className="text-xs text-muted-foreground">Games played</p>
                    <p className="text-lg font-semibold">{data.overview.totals.gameSessions}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card/60 p-3">
                    <p className="text-xs text-muted-foreground">Habit check-ins</p>
                    <p className="text-lg font-semibold">{data.overview.totals.habitCheckIns}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card/60 p-3">
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
    <div className="rounded-xl border border-border bg-card/60 p-3">
      <div className="flex items-start gap-3">
        <span className="rounded-lg bg-primary/10 p-2 text-primary">
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
