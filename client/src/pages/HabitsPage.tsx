import { useState } from 'react';
import { Archive, Check, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { LoadingState } from '@/components/ui/spinner';
import { useAsync } from '@/hooks/useAsync';
import { ApiError } from '@/services/api';
import { habitService, type HabitInput } from '@/features/wellness/wellnessService';
import { RewardNote } from '@/features/wellness/RewardNote';
import { useApplyReward } from '@/features/wellness/useApplyReward';
import type {
  Habit,
  HabitCategory,
  HabitFrequency,
  RewardSummary,
} from '@/features/wellness/types';

const CATEGORY_LABELS: Record<HabitCategory, string> = {
  sleep: 'Sleep',
  movement: 'Movement',
  mindfulness: 'Mindfulness',
  social: 'Social',
  focus: 'Focus',
  custom: 'Custom',
};

const EMOJI_CHOICES = ['✅', '💧', '🧘', '📖', '🚶', '🌙', '☀️', '💬', '🎯'];

export function HabitsPage(): React.JSX.Element {
  const [showArchived, setShowArchived] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('custom');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [emoji, setEmoji] = useState('✅');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [reward, setReward] = useState<RewardSummary | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const applyReward = useApplyReward();

  const { data, error, loading, reload } = useAsync(
    () => habitService.list(showArchived),
    [showArchived],
  );

  async function handleCreate(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    if (name.trim().length < 2) {
      setSaveError('Give your habit a name (at least 2 characters).');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const payload: HabitInput = {
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        frequency,
        emoji,
      };
      await habitService.create(payload);
      setName('');
      setDescription('');
      reload();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not create the habit.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(habit: Habit, dayKey: string, completed: boolean): Promise<void> {
    setBusyId(habit.id);
    setSaveError(null);
    try {
      const result = await habitService.toggle(habit.id, completed, dayKey);
      setReward(result.reward);
      applyReward(result.reward);
      reload();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not update that habit.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleArchive(habit: Habit): Promise<void> {
    setSaveError(null);
    try {
      await habitService.update(habit.id, { archived: !habit.archived });
      reload();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not update that habit.');
    }
  }

  async function handleDelete(id: string): Promise<void> {
    setSaveError(null);
    try {
      await habitService.remove(id);
      reload();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not delete that habit.');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Habits"
        description="Small, repeatable actions. Missing a day is okay — the goal is gentle consistency."
        actions={
          <Button variant="outline" size="sm" onClick={() => setShowArchived((v) => !v)}>
            {showArchived ? 'Hide archived' : 'Show archived'}
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create a habit</CardTitle>
          <CardDescription>Keep it small enough to be doable on a hard day.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="habit-name">Name</Label>
                <Input
                  id="habit-name"
                  value={name}
                  maxLength={80}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Step outside for 5 minutes"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="habit-category">Category</Label>
                <Select
                  id="habit-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as HabitCategory)}
                >
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="habit-description">Description (optional)</Label>
              <Input
                id="habit-description"
                value={description}
                maxLength={300}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does success look like?"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="habit-frequency">Frequency</Label>
                <Select
                  id="habit-frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="custom">Custom</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="flex flex-wrap gap-1">
                  {EMOJI_CHOICES.map((choice) => (
                    <Button
                      key={choice}
                      type="button"
                      variant={emoji === choice ? 'default' : 'outline'}
                      size="icon"
                      aria-label={`Choose icon ${choice}`}
                      aria-pressed={emoji === choice}
                      onClick={() => setEmoji(choice)}
                    >
                      <span aria-hidden="true">{choice}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {saveError ? <Alert variant="error">{saveError}</Alert> : null}

            <Button type="submit" disabled={saving}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              {saving ? 'Creating…' : 'Create habit'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {reward ? <RewardNote reward={reward} /> : null}
      {error ? <Alert variant="error">{error.message}</Alert> : null}
      {loading ? <LoadingState label="Loading your habits…" /> : null}

      {data && data.length === 0 ? (
        <Alert variant="info">No habits yet. Create your first one above.</Alert>
      ) : null}

      {data && data.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              busy={busyId === habit.id}
              onToggle={handleToggle}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function HabitCard({
  habit,
  busy,
  onToggle,
  onArchive,
  onDelete,
}: {
  habit: Habit;
  busy: boolean;
  onToggle: (habit: Habit, dayKey: string, completed: boolean) => void;
  onArchive: (habit: Habit) => void;
  onDelete: (id: string) => void;
}): React.JSX.Element {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <Card className={habit.archived ? 'opacity-70' : undefined}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <span className="text-2xl" aria-hidden="true">
              {habit.emoji}
            </span>
            <div>
              <CardTitle className="text-base">{habit.name}</CardTitle>
              {habit.description ? (
                <CardDescription>{habit.description}</CardDescription>
              ) : (
                <CardDescription>{CATEGORY_LABELS[habit.category]}</CardDescription>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label={habit.archived ? 'Unarchive habit' : 'Archive habit'}
              onClick={() => onArchive(habit)}
            >
              <Archive className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete habit"
              onClick={() => onDelete(habit.id)}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant={habit.completedToday ? 'success' : 'outline'}>
            {habit.completedToday ? 'Done today' : 'Not done today'}
          </Badge>
          <Badge variant="secondary">{habit.currentStreak}-day streak</Badge>
          <Badge variant="outline">
            {habit.completionsThisWeek}/{habit.weeklyTarget} this week
          </Badge>
        </div>

        <div>
          <p className="mb-1 text-xs text-muted-foreground">Last 7 days</p>
          <div className="flex gap-1">
            {habit.recentDays.map((day) => (
              <Button
                key={day.dayKey}
                type="button"
                variant={day.completed ? 'default' : 'outline'}
                size="icon"
                className="h-9 w-9"
                disabled={busy}
                aria-label={`${day.dayKey} ${day.completed ? 'completed' : 'not completed'}`}
                aria-pressed={day.completed}
                onClick={() => onToggle(habit, day.dayKey, !day.completed)}
              >
                {day.completed ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <span className="text-[10px]" aria-hidden="true">
                    {day.dayKey.slice(8)}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>

        <Button
          variant={habit.completedToday ? 'outline' : 'default'}
          size="sm"
          disabled={busy}
          onClick={() => onToggle(habit, today, !habit.completedToday)}
        >
          {habit.completedToday ? 'Mark as not done today' : 'Mark done today'}
        </Button>
      </CardContent>
    </Card>
  );
}
