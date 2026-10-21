import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, BookHeart, Moon, Flame, Target, Trophy } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { LoadingState } from '@/components/ui/spinner';
import { Button, buttonVariants } from '@/components/ui/button';
import { useAsync } from '@/hooks/useAsync';
import { MiniBarChart, type BarDatum } from '@/features/wellness/MiniBarChart';
import { analyticsService } from '@/features/analytics/analyticsService';
import type { TrendPoint } from '@/features/analytics/types';

const RANGE_OPTIONS = [7, 14, 30] as const;

export function shortLabel(dayKey: string): string {
  const [, m, d] = dayKey.split('-');
  return `${Number(d)}/${Number(m)}`;
}

export function toBars(points: TrendPoint[], max: number | null): BarDatum[] {
  const peak = max ?? Math.max(1, ...points.map((p) => p.value ?? 0));
  return points.map((point) => ({
    label: shortLabel(point.dayKey),
    value: point.value === null ? null : Math.min(1, point.value / peak),
    caption:
      point.value === null ? `${point.dayKey}: no entry` : `${point.dayKey}: ${point.value}`,
  }));
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}): React.JSX.Element {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <span className="rounded-md bg-primary/10 p-2 text-primary">{icon}</span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold">{value}</p>
          {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsPage(): React.JSX.Element {
  const [days, setDays] = useState<number>(14);
  const { data, error, loading, reload } = useAsync(() => analyticsService.overview(days), [days]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Wellness insights</h1>
          <p className="text-sm text-muted-foreground">
            A reflection of what you have logged. These are not medical measurements.
          </p>
        </div>
        <div className="flex gap-2" role="group" aria-label="Time range">
          {RANGE_OPTIONS.map((option) => (
            <Button
              key={option}
              variant={option === days ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDays(option)}
              aria-pressed={option === days}
            >
              {option} days
            </Button>
          ))}
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
      {loading ? <LoadingState label="Building your insights…" /> : null}

      {data ? (
        <>
          <Card>
            <CardContent className="space-y-3 py-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Level {data.wellness.level} · {data.wellness.xp} XP
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Flame className="h-4 w-4 text-primary" aria-hidden="true" />
                  {data.wellness.streakDays}-day streak (best {data.wellness.longestStreak})
                </span>
              </div>
              <Progress
                value={data.wellness.xpIntoLevel}
                max={data.wellness.xpForNextLevel}
                label={`Level ${data.wellness.level} progress`}
              />
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<BookHeart className="h-4 w-4" aria-hidden="true" />}
              label="Mood check-ins"
              value={String(data.mood.entriesLogged)}
              hint={data.mood.averageScore !== null ? `Avg ${data.mood.averageScore}/5` : undefined}
            />
            <StatCard
              icon={<Moon className="h-4 w-4" aria-hidden="true" />}
              label="Nights slept"
              value={String(data.sleep.nightsLogged)}
              hint={
                data.sleep.averageDurationMinutes !== null
                  ? `${Math.round(data.sleep.averageDurationMinutes / 60)}h avg`
                  : undefined
              }
            />
            <StatCard
              icon={<Activity className="h-4 w-4" aria-hidden="true" />}
              label="Activity"
              value={`${data.activity.totalMinutes} min`}
              hint={`${data.activity.activeDays} active days`}
            />
            <StatCard
              icon={<Target className="h-4 w-4" aria-hidden="true" />}
              label="Habit check-ins"
              value={String(data.totals.habitCheckIns)}
              hint={`${data.habits.activeHabits} active habits`}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mood trend</CardTitle>
                <CardDescription>Daily average mood score (1–5).</CardDescription>
              </CardHeader>
              <CardContent>
                <MiniBarChart
                  data={toBars(data.mood.trend, 5)}
                  ariaLabel="Daily average mood over the selected range"
                  emptyLabel="Log a mood check-in to see your trend."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sleep duration</CardTitle>
                <CardDescription>Total minutes slept per night.</CardDescription>
              </CardHeader>
              <CardContent>
                <MiniBarChart
                  data={toBars(data.sleep.trend, 600)}
                  ariaLabel="Sleep duration per night over the selected range"
                  emptyLabel="Log a night of sleep to see your trend."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Movement minutes</CardTitle>
                <CardDescription>Minutes of activity per day.</CardDescription>
              </CardHeader>
              <CardContent>
                <MiniBarChart
                  data={toBars(data.activity.trend, null)}
                  ariaLabel="Activity minutes per day over the selected range"
                  emptyLabel="Log an activity to see your trend."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Trophy className="h-4 w-4 text-primary" aria-hidden="true" />
                  Habits
                </CardTitle>
                <CardDescription>Consistency over the last 7 days.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completions (7 days)</span>
                  <span className="font-medium">{data.habits.completionsLast7Days}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active habits</span>
                  <span className="font-medium">{data.habits.activeHabits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Best streak</span>
                  <span className="font-medium">{data.habits.bestStreak} days</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Latest check-in</CardTitle>
              <CardDescription>Your most recent assessment summary.</CardDescription>
            </CardHeader>
            <CardContent>
              {data.latestAssessment ? (
                <div className="space-y-3">
                  <p className="text-sm">{data.latestAssessment.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {data.latestAssessment.priorities.map((priority) => (
                      <Badge key={priority} variant="secondary">
                        {priority}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(data.latestAssessment.completedAt).toLocaleDateString()}
                  </p>
                  <Link
                    to={`/assessments/results/${data.latestAssessment.id}`}
                    className={buttonVariants({ variant: 'outline', size: 'sm' })}
                  >
                    View full result
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    You have not completed a check-in yet.
                  </p>
                  <Link to="/assessments" className={buttonVariants({ size: 'sm' })}>
                    Start a check-in
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
