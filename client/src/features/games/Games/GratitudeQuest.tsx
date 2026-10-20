import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { GameShell } from '../GameShell';
import { sample, shuffle } from '../gameLogic';
import type { GameComponentProps } from '../types';

const SCENES = [
  { emoji: '🌤️', good: 'A sunny morning', bad: 'A loud storm' },
  { emoji: '🍲', good: 'A warm meal', bad: 'A broken plate' },
  { emoji: '🐕', good: 'A friendly pet', bad: 'A scary noise' },
  { emoji: '🌳', good: 'A shady tree', bad: 'A busy road' },
  { emoji: '🎶', good: 'A favourite song', bad: 'A flat tyre' },
  { emoji: '🛏️', good: 'A cosy bed', bad: 'A pile of chores' },
  { emoji: '🤝', good: 'A helping hand', bad: 'A grumpy queue' },
  { emoji: '🖍️', good: 'Time to draw', bad: 'A spilled drink' },
];

interface RoundData {
  items: { label: string; good: boolean; id: string }[];
}

function makeRound(): RoundData {
  const chosen = sample(SCENES, 3);
  const good = shuffle(chosen).slice(0, 2).map((s, i) => ({ label: s.good, good: true, id: `g${i}` }));
  const bad = shuffle(chosen).slice(0, 1).map((s, i) => ({ label: s.bad, good: false, id: `b${i}` }));
  return { items: shuffle([...good, ...bad]) };
}

export function GratitudeQuest({ game, onFinish, onExit }: GameComponentProps): React.JSX.Element {
  const rounds = Number(game.settings.rounds ?? 5);

  const [round, setRound] = useState(0);
  const [data, setData] = useState<RoundData>(makeRound);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);

  const goodCount = useMemo(() => data.items.filter((i) => i.good).length, [data]);
  const pickedGood = useMemo(
    () => data.items.filter((i) => i.good && picked.has(i.id)).length,
    [data, picked],
  );
  const allPicked = picked.size >= goodCount;

  function tap(id: string, good: boolean) {
    if (picked.has(id) || allPicked) return;
    if (!good) return;
    setPicked((prev) => new Set(prev).add(id));
  }

  function next() {
    const roundScore = pickedGood;
    setScore((s) => s + roundScore);
    if (round + 1 >= rounds) {
      onFinish({
        score: score + roundScore,
        maxScore: rounds * 2,
        completed: true,
        summary: { rounds },
      });
      return;
    }
    setRound((r) => r + 1);
    setData(makeRound());
    setPicked(new Set());
  }

  return (
    <GameShell
      title={game.title}
      roundLabel={`Round ${round + 1} of ${rounds}`}
      progress={round / rounds}
      onExit={onExit}
      footer={allPicked ? <Button onClick={next}>{round + 1 >= rounds ? 'See my results' : 'Next round'}</Button> : undefined}
    >
      <p className="mb-3 text-sm text-muted-foreground" role="status">
        Tap the things you could be thankful for. Take your time and notice how it feels.
      </p>

      <div className="mx-auto grid max-w-md grid-cols-1 gap-3 sm:grid-cols-3" role="group" aria-label="Gratitude items">
        {data.items.map((item) => {
          const isPicked = picked.has(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => tap(item.id, item.good)}
              disabled={isPicked || allPicked}
              aria-pressed={isPicked}
              className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center text-sm transition-colors focus-visible:outline-2 focus-visible:outline-ring ${
                isPicked
                  ? 'border-primary bg-primary/15'
                  : item.good
                    ? 'border-border bg-card hover:bg-muted'
                    : 'border-border bg-muted/40'
              }`}
            >
              <span className="text-2xl" aria-hidden="true">
                {isPicked ? '💛' : item.good ? '✨' : '🌧️'}
              </span>
              {item.label}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Found {pickedGood} of {goodCount} good things this round.
      </p>
    </GameShell>
  );
}
