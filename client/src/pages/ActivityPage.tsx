import { useState } from 'react';
import { Footprints, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { LoadingState } from '@/components/ui/spinner';
import { useAsync } from '@/hooks/useAsync';
import { ApiError } from '@/services/api';
import { activityService } from '@/features/wellness/wellnessService';
import { MiniBarChart } from '@/features/wellness/MiniBarChart';
import { RewardNote } from '@/features/wellness/RewardNote';
import { useApplyReward } from '@/features/wellness/useApplyReward';
import {
  ACTIVITY_TYPES,
  type ActivityEntry,
  type ActivityType,
  type RewardSummary,
} from '@/features/wellness/types';

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  walk: 'Walk',
  run: 'Run',
  cycle: 'Cycle',
  yoga: 'Yoga',
  strength: 'Strength',
  sport: 'Sport',
  stretch: 'Stretch',
  dance: 'Dance',
  other: 'Other',
};

export function ActivityPage(): React.JSX.Element {
  const [type, setType] = useState<ActivityType>('walk');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [steps, setSteps] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [reward, setReward] = useState<RewardSummary | null>(null);
  const applyReward = useApplyReward();

  const { data, error, loading, reload } = useAsync(async () => {
    const [summary, history] = await Promise.all([
      activityService.summary(14),
      activityService.list(1, 10),
    ]);
    return { summary, history };
  }, []);

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setSaving(true);
    setSaveError(null);
    setReward(null);
    try {
      const stepsNumber = steps.trim() ? Number(steps) : undefined;
      if (stepsNumber !== undefined && (!Number.isFinite(stepsNumber) || stepsNumber < 0)) {
        setSaveError('Steps must be a positive number.');
        setSaving(false);
        return;
      }
      const result = await activityService.create({
        type,
        durationMinutes,
        steps: stepsNumber,
        notes: notes.trim() || undefined,
      });
      setReward(result.reward);
      applyReward(result.reward);
      setNotes('');
      setSteps('');
      reload();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not save your activity.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string): Promise<void> {
    setSaveError(null);
    try {
      await activityService.remove(id);
      reload();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not delete that entry.');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity"
        description="Move in whatever way feels good. This tracks time spent moving — there are no calories or body measurements here."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Log an activity</CardTitle>
          <CardDescription>Every kind of movement counts.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="activity-type">Type</Label>
                <Select
                  id="activity-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as ActivityType)}
                >
                  {ACTIVITY_TYPES.map((value) => (
                    <option key={value} value={value}>
                      {ACTIVITY_LABELS[value]}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="activity-duration">Duration (minutes)</Label>
                <Input
                  id="activity-duration"
                  type="number"
                  min={1}
                  max={1440}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="activity-steps">Steps (optional)</Label>
              <Input
                id="activity-steps"
                type="number"
                min={0}
                max={200_000}
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                placeholder="e.g. 5000"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="activity-notes">Notes (optional)</Label>
              <Textarea
                id="activity-notes"
                value={notes}
                maxLength={500}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did it feel?"
              />
            </div>

            {saveError ? <Alert variant="error">{saveError}</Alert> : null}
            {reward ? <RewardNote reward={reward} /> : null}

            <Button type="submit" disabled={saving}>
              <Footprints className="h-4 w-4" aria-hidden="true" />
              {saving ? 'Saving…' : 'Log activity'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? <Alert variant="error">{error.message}</Alert> : null}
      {loading ? <LoadingState label="Loading your activity…" /> : null}

      {data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Last 14 days</CardTitle>
              <CardDescription>
                {data.summary.totalSessions > 0
                  ? `${data.summary.totalMinutes} minutes across ${data.summary.totalSessions} session(s) on ${data.summary.activeDays} day(s).`
                  : 'Log an activity to see your pattern.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MiniBarChart
                ariaLabel="Activity minutes over the last 14 days"
                data={data.summary.series.map((point) => ({
                  label: point.dayKey.slice(5),
                  value:
                    point.durationMinutes === 0 ? null : Math.min(point.durationMinutes / 60, 1),
                  caption: `${point.dayKey}: ${point.durationMinutes} min, ${point.sessions} session(s)`,
                }))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent sessions</CardTitle>
              <CardDescription>Your latest activity logs.</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityList entries={data.history.items} onDelete={handleDelete} />
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function ActivityList({
  entries,
  onDelete,
}: {
  entries: ActivityEntry[];
  onDelete: (id: string) => void;
}): React.JSX.Element {
  if (entries.length === 0) {
    return <Alert variant="info">No activity logged yet.</Alert>;
  }
  return (
    <ul className="space-y-3">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="flex items-start justify-between gap-3 border-b pb-3 last:border-0"
        >
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{ACTIVITY_LABELS[entry.type]}</span>
              <Badge variant="outline">{entry.durationMinutes} min</Badge>
              {entry.steps !== null ? <Badge variant="secondary">{entry.steps} steps</Badge> : null}
            </div>
            {entry.notes ? (
              <p className="mt-1 text-sm text-muted-foreground">{entry.notes}</p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete activity entry"
            onClick={() => onDelete(entry.id)}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
