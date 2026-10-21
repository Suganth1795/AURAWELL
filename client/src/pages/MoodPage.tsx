import { useState } from 'react';
import { MessageSquarePlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingState } from '@/components/ui/spinner';
import { useAsync } from '@/hooks/useAsync';
import { ApiError } from '@/services/api';
import { moodService } from '@/features/wellness/wellnessService';
import { MiniBarChart } from '@/features/wellness/MiniBarChart';
import { RewardNote } from '@/features/wellness/RewardNote';
import { useApplyReward } from '@/features/wellness/useApplyReward';
import type { MoodEntry, MoodValue, RewardSummary } from '@/features/wellness/types';

const MOOD_OPTIONS: { value: MoodValue; label: string; emoji: string }[] = [
  { value: 'great', label: 'Great', emoji: '😄' },
  { value: 'good', label: 'Good', emoji: '🙂' },
  { value: 'okay', label: 'Okay', emoji: '😐' },
  { value: 'low', label: 'Low', emoji: '😔' },
  { value: 'struggling', label: 'Struggling', emoji: '😣' },
];

export function MoodPage(): React.JSX.Element {
  const [mood, setMood] = useState<MoodValue>('okay');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [reward, setReward] = useState<RewardSummary | null>(null);
  const applyReward = useApplyReward();

  const { data, error, loading, reload } = useAsync(async () => {
    const [today, trend, history] = await Promise.all([
      moodService.today(),
      moodService.trend(14),
      moodService.history(1, 10),
    ]);
    return { today, trend, history };
  }, []);

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setSaving(true);
    setSaveError(null);
    setReward(null);
    try {
      const result = await moodService.create({ mood, note: note.trim() || undefined });
      setReward(result.reward);
      applyReward(result.reward);
      setNote('');
      reload();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not save your mood.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string): Promise<void> {
    setSaveError(null);
    try {
      await moodService.remove(id);
      reload();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not delete that entry.');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mood"
        description="Check in with how you feel. There are no right or wrong answers, and nothing is shared with anyone."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How are you feeling right now?</CardTitle>
          <CardDescription>
            Pick the closest word. You can log more than once a day.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Mood</legend>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Mood">
                {MOOD_OPTIONS.map((option) => {
                  const selected = mood === option.value;
                  return (
                    <Button
                      key={option.value}
                      type="button"
                      variant={selected ? 'default' : 'outline'}
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setMood(option.value)}
                    >
                      <span aria-hidden="true">{option.emoji}</span>
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </fieldset>

            <div className="space-y-1.5">
              <Label htmlFor="mood-note">Note (optional)</Label>
              <Textarea
                id="mood-note"
                value={note}
                maxLength={500}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Anything you want to remember about this moment?"
              />
            </div>

            {saveError ? <Alert variant="error">{saveError}</Alert> : null}
            {reward ? <RewardNote reward={reward} /> : null}

            <Button type="submit" disabled={saving}>
              <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
              {saving ? 'Saving…' : 'Log mood'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? <Alert variant="error">{error.message}</Alert> : null}
      {loading ? <LoadingState label="Loading your mood history…" /> : null}

      {data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Last 14 days</CardTitle>
              <CardDescription>
                Average mood score per day (1 = struggling, 5 = great).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MiniBarChart
                ariaLabel="Average mood score over the last 14 days"
                data={data.trend.map((point) => ({
                  label: point.dayKey.slice(5),
                  value: point.average === null ? null : (point.average - 1) / 4,
                  caption:
                    point.average === null
                      ? `${point.dayKey}: no entry`
                      : `${point.dayKey}: ${point.average} (${point.entryCount} entries)`,
                }))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent entries</CardTitle>
              <CardDescription>Your latest check-ins.</CardDescription>
            </CardHeader>
            <CardContent>
              <MoodHistoryList
                entries={data.history.items}
                today={data.today}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function MoodHistoryList({
  entries,
  today,
  onDelete,
}: {
  entries: MoodEntry[];
  today: MoodEntry[];
  onDelete: (id: string) => void;
}): React.JSX.Element {
  const seen = new Set<string>();
  const combined = [...today, ...entries].filter((entry) => {
    if (seen.has(entry.id)) return false;
    seen.add(entry.id);
    return true;
  });

  if (combined.length === 0) {
    return <Alert variant="info">No mood entries yet. Log your first check-in above.</Alert>;
  }

  return (
    <ul className="space-y-3">
      {combined.map((entry) => {
        const option = MOOD_OPTIONS.find((o) => o.value === entry.mood);
        return (
          <li
            key={entry.id}
            className="flex items-start justify-between gap-3 border-b pb-3 last:border-0"
          >
            <div>
              <div className="flex items-center gap-2">
                <span aria-hidden="true">{option?.emoji}</span>
                <span className="font-medium">{option?.label ?? entry.mood}</span>
                <Badge variant="outline">{new Date(entry.recordedAt).toLocaleString()}</Badge>
              </div>
              {entry.note ? (
                <p className="mt-1 text-sm text-muted-foreground">{entry.note}</p>
              ) : null}
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete mood entry"
              onClick={() => onDelete(entry.id)}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
