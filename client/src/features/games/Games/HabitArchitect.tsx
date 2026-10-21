import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GameShell } from '../GameShell';
import { clamp } from '../gameLogic';
import type { GameComponentProps } from '../types';

const IDEAS = [
  'Drink a glass of water when I wake up',
  'Put my shoes by the door the night before',
  'Take three slow breaths before opening my phone',
  'Walk for five minutes after lunch',
  'Write one line in a journal before bed',
  'Stretch while the kettle boils',
];

export function HabitArchitect({ game, onExit, onFinish }: GameComponentProps): React.JSX.Element {
  const minSteps = Number(game.settings.minSteps ?? 3);
  const maxSteps = Number(game.settings.maxSteps ?? 6);

  const [habit, setHabit] = useState('');
  const [steps, setSteps] = useState<string[]>([]);
  const [draft, setDraft] = useState('');

  function addStep(text: string) {
    const value = text.trim();
    if (!value || steps.length >= maxSteps) return;
    setSteps((s) => [...s, value]);
    setDraft('');
  }

  function removeStep(index: number) {
    setSteps((s) => s.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    setSteps((s) => {
      const target = index + direction;
      if (target < 0 || target >= s.length) return s;
      const copy = [...s];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }

  const canFinish = habit.trim().length > 0 && steps.length >= minSteps;

  function finish() {
    onFinish({
      score: clamp(steps.length, 0, maxSteps),
      maxScore: maxSteps,
      completed: true,
      summary: { stepCount: steps.length, habitLength: habit.trim().length },
    });
  }

  return (
    <GameShell
      title={game.title}
      roundLabel={`${steps.length}/${maxSteps} steps`}
      progress={steps.length / maxSteps}
      onExit={onExit}
      footer={canFinish ? <Button onClick={finish}>Build my plan</Button> : undefined}
    >
      <p className="mb-3 text-sm text-muted-foreground">
        Turn one small habit into tiny, easy steps. Small enough to feel almost too easy is perfect.
      </p>

      <div className="mb-4">
        <label htmlFor="habit-name" className="mb-1 block text-sm font-medium">
          The habit I want to build
        </label>
        <Input
          id="habit-name"
          value={habit}
          maxLength={80}
          placeholder="e.g. Move a little each morning"
          onChange={(e) => setHabit(e.target.value)}
        />
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {IDEAS.slice(0, 4).map((idea) => (
          <button
            key={idea}
            type="button"
            onClick={() => addStep(idea)}
            disabled={steps.length >= maxSteps}
            className="rounded-full border border-border bg-card px-3 py-1 text-xs hover:bg-muted disabled:opacity-50"
          >
            + {idea}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={draft}
          maxLength={100}
          aria-label="Add your own step"
          placeholder="Add your own step…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addStep(draft);
            }
          }}
        />
        <Button variant="outline" onClick={() => addStep(draft)} disabled={!draft.trim()}>
          Add
        </Button>
      </div>

      {steps.length > 0 ? (
        <ol className="mt-4 space-y-2">
          {steps.map((step, index) => (
            <li
              key={`${step}-${index}`}
              className="flex items-center gap-2 rounded-lg border border-border bg-card p-2 text-sm"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs">
                {index + 1}
              </span>
              <span className="flex-1">{step}</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Move step ${index + 1} up`}
                onClick={() => move(index, -1)}
                disabled={index === 0}
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Move step ${index + 1} down`}
                onClick={() => move(index, 1)}
                disabled={index === steps.length - 1}
              >
                ↓
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove step ${index + 1}`}
                onClick={() => removeStep(index)}
              >
                ✕
              </Button>
            </li>
          ))}
        </ol>
      ) : null}

      {!canFinish ? (
        <p className="mt-3 text-xs text-muted-foreground" role="status">
          Add a habit name and at least {minSteps} steps to finish.
        </p>
      ) : null}
    </GameShell>
  );
}
