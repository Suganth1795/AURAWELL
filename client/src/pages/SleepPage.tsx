import { useState } from 'react';
import { Moon, Trash2 } from 'lucide-react';
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
import { sleepService } from '@/features/wellness/wellnessService';
import { MiniBarChart } from '@/features/wellness/MiniBarChart';
import { RewardNote } from '@/features/wellness/RewardNote';
import { useApplyReward } from '@/features/wellness/useApplyReward';
import type { RewardSummary, SleepEntry } from '@/features/wellness/types';

function toLocalInput(date: Date): string {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

export function SleepPage(): React.JSX.Element {
  const now = new Date();
  const eightHoursAgo = new Date(now.getTime() - 8 * 60 * 60 * 1000);
  const [startTime, setStartTime] = useState(toLocalInput(eightHoursAgo));
  const [endTime, setEndTime] = useState(toLocalInput(now));
  const [quality, setQuality] = useState(3);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [reward, setReward] = useState<RewardSummary | null>(null);
  const applyReward = useApplyReward();

  const { data, error, loading, reload } = useAsync(async () => {
    const [summary, history] = await Promise.all([
      sleepService.summary(14),
      sleepService.list(1, 10),
    ]);
    return { summary, history };
  }, []);

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setSaving(true);
    setSaveError(null);
    setReward(null);
    try {
      const result = await sleepService.create({
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        quality,
        notes: notes.trim() || undefined,
      });
      setReward(result.reward);
      applyReward(result.reward);
      setNotes('');
      reload();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not save your sleep.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string): Promise<void> {
    setSaveError(null);
    try {
      await sleepService.remove(id);
      reload();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not delete that record.');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sleep"
        description="Track your rest to spot patterns over time. This is a wellbeing log, not a medical tool."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Log last night&apos;s sleep</CardTitle>
          <CardDescription>Record when you went to bed and woke up.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="sleep-start">Went to bed</Label>
                <Input
                  id="sleep-start"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sleep-end">Woke up</Label>
                <Input
                  id="sleep-end"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sleep-quality">How rested did you feel? (1-5)</Label>
              <Select
                id="sleep-quality"
                value={String(quality)}
                onChange={(e) => setQuality(Number(e.target.value))}
              >
                <option value="1">1 — Not at all rested</option>
                <option value="2">2 — Slightly</option>
                <option value="3">3 — Okay</option>
                <option value="4">4 — Well rested</option>
                <option value="5">5 — Very well rested</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sleep-notes">Notes (optional)</Label>
              <Textarea
                id="sleep-notes"
                value={notes}
                maxLength={500}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything that affected your sleep?"
              />
            </div>

            {saveError ? <Alert variant="error">{saveError}</Alert> : null}
            {reward ? <RewardNote reward={reward} /> : null}

            <Button type="submit" disabled={saving}>
              <Moon className="h-4 w-4" aria-hidden="true" />
              {saving ? 'Saving…' : 'Log sleep'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? <Alert variant="error">{error.message}</Alert> : null}
      {loading ? <LoadingState label="Loading your sleep history…" /> : null}

      {data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Last 14 nights</CardTitle>
              <CardDescription>
                {data.summary.averageDurationMinutes !== null
                  ? `Average ${formatDuration(data.summary.averageDurationMinutes)} across ${data.summary.nightsLogged} night(s).`
                  : 'Log a night to see your pattern.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MiniBarChart
                ariaLabel="Sleep duration over the last 14 nights"
                data={data.summary.series.map((point) => ({
                  label: point.dayKey.slice(5),
                  value:
                    point.durationMinutes === null
                      ? null
                      : Math.min(point.durationMinutes / 720, 1),
                  caption:
                    point.durationMinutes === null
                      ? `${point.dayKey}: no entry`
                      : `${point.dayKey}: ${formatDuration(point.durationMinutes)}`,
                }))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent nights</CardTitle>
              <CardDescription>Your latest sleep logs.</CardDescription>
            </CardHeader>
            <CardContent>
              <SleepList entries={data.history.items} onDelete={handleDelete} />
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function SleepList({
  entries,
  onDelete,
}: {
  entries: SleepEntry[];
  onDelete: (id: string) => void;
}): React.JSX.Element {
  if (entries.length === 0) {
    return <Alert variant="info">No sleep entries yet.</Alert>;
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
              <span className="font-medium">{formatDuration(entry.durationMinutes)}</span>
              <Badge variant="outline">Quality {entry.quality}/5</Badge>
              <Badge variant="secondary">{entry.dayKey}</Badge>
            </div>
            {entry.notes ? (
              <p className="mt-1 text-sm text-muted-foreground">{entry.notes}</p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete sleep entry"
            onClick={() => onDelete(entry.id)}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
