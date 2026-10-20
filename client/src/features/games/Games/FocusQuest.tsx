import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { GameShell } from '../GameShell';
import { clamp, difficultyFactor, sample, shuffle } from '../gameLogic';
import type { GameComponentProps } from '../types';

const OBJECTS = [
  { id: 'leaf', emoji: '🍃', name: 'leaf' },
  { id: 'stone', emoji: '🪨', name: 'stone' },
  { id: 'flower', emoji: '🌼', name: 'flower' },
  { id: 'mushroom', emoji: '🍄', name: 'mushroom' },
  { id: 'bug', emoji: '🐞', name: 'ladybird' },
  { id: 'seed', emoji: '🌰', name: 'seed' },
];

interface Tile {
  key: number;
  object: (typeof OBJECTS)[number];
  isTarget: boolean;
}

function makeBoard(difficulty: number): { tiles: Tile[]; target: (typeof OBJECTS)[number] } {
  const target = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
  const targetCount = clamp(
    Math.round(2 + (difficultyFactor(difficulty, 1) - 1) * 1.5),
    2,
    4,
  );
  const distractorCount = clamp(
    Math.round(4 + (difficultyFactor(difficulty, 1) - 1) * 2),
    4,
    9,
  );
  const others = OBJECTS.filter((o) => o.id !== target.id);
  const tiles: Tile[] = [];
  for (let i = 0; i < targetCount; i++) tiles.push({ key: i, object: target, isTarget: true });
  for (let i = 0; i < distractorCount; i++) {
    tiles.push({ key: targetCount + i, object: sample(others, 1)[0], isTarget: false });
  }
  return { tiles: shuffle(tiles), target };
}

export function FocusQuest({ game, difficulty, onFinish, onExit }: GameComponentProps): React.JSX.Element {
  const rounds = Number(game.settings.rounds ?? 5);
  const secondsPerRound = Number(game.settings.secondsPerRound ?? 30);

  const [round, setRound] = useState(0);
  const [board, setBoard] = useState(() => makeBoard(difficulty));
  const [found, setFound] = useState<Set<number>>(new Set());
  const [misses, setMisses] = useState(0);
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(secondsPerRound);

  const targetTiles = useMemo(() => board.tiles.filter((t) => t.isTarget), [board]);
  const allFound = found.size >= targetTiles.length;
  const done = allFound || secondsLeft <= 0;

  // Countdown runs only while the round is active; phase is derived from `done`.
  useEffect(() => {
    if (done) return;
    const t = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [done, secondsLeft]);

  function tap(tile: Tile) {
    if (done || found.has(tile.key)) return;
    if (tile.isTarget) {
      setFound((prev) => new Set(prev).add(tile.key));
    } else {
      setMisses((m) => m + 1);
    }
  }

  function nextRound() {
    const roundScore = allFound ? 1 : 0;
    if (round + 1 >= rounds) {
      onFinish({
        score: score + roundScore,
        maxScore: rounds,
        completed: true,
        summary: { rounds, misses },
      });
      return;
    }
    setScore((s) => s + roundScore);
    setRound((r) => r + 1);
    setBoard(makeBoard(difficulty));
    setFound(new Set());
    setSecondsLeft(secondsPerRound);
  }

  return (
    <GameShell
      title={game.title}
      roundLabel={`Round ${round + 1} of ${rounds}`}
      progress={round / rounds}
      onExit={onExit}
      footer={
        !done ? (
          <span className="text-xs text-muted-foreground">⏱ {secondsLeft}s · misses: {misses}</span>
        ) : (
          <Button onClick={nextRound}>{round + 1 >= rounds ? 'See my results' : 'Next round'}</Button>
        )
      }
    >
      <p className="mb-3 text-sm text-muted-foreground" role="status">
        Find {targetTiles.length} <span aria-hidden="true">{board.target.emoji}</span>{' '}
        <strong>{board.target.name}</strong>
        {targetTiles.length === 1 ? '' : 's'} hiding in the garden.
      </p>

      <div
        className="mx-auto grid max-w-md grid-cols-4 gap-2 sm:grid-cols-5"
        role="group"
        aria-label="Garden objects"
      >
        {board.tiles.map((tile) => {
          const isFound = found.has(tile.key);
          return (
            <button
              key={tile.key}
              type="button"
              onClick={() => tap(tile)}
              disabled={done || isFound}
              aria-label={
                isFound
                  ? `Found ${tile.object.name}`
                  : `Garden item ${tile.object.name === board.target.name ? '(target)' : ''}`
              }
              className={`flex aspect-square items-center justify-center rounded-xl border text-3xl transition-colors focus-visible:outline-2 focus-visible:outline-ring ${
                isFound
                  ? 'border-primary bg-primary/20 opacity-60'
                  : 'border-border bg-card hover:bg-muted disabled:hover:bg-card'
              }`}
            >
              <span aria-hidden="true">{isFound ? '✅' : tile.object.emoji}</span>
            </button>
          );
        })}
      </div>

      {done ? (
        <p className="mt-3 text-center text-sm text-muted-foreground" aria-live="polite">
          {allFound ? 'You found them all!' : 'Time is up — nice focusing!'}
        </p>
      ) : null}
    </GameShell>
  );
}
