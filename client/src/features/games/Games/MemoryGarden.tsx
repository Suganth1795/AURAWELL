import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { GameShell } from '../GameShell';
import { clamp, difficultyFactor } from '../gameLogic';
import type { GameComponentProps } from '../types';

const FLOWERS = ['🌷', '🌻', '🌸', '🌼', '🌺', '🪻', '🌹'];
const CELLS = 6;

type Phase = 'watch' | 'recall' | 'correct' | 'wrong';

function makeSequence(length: number): number[] {
  return Array.from({ length }, () => Math.floor(Math.random() * CELLS));
}

export function MemoryGarden({ game, difficulty, onFinish, onExit }: GameComponentProps): React.JSX.Element {
  const rounds = Number(game.settings.rounds ?? 5);
  const start = Number(game.settings.sequenceStart ?? 3);
  const maxLen = Number(game.settings.sequenceMax ?? 8);
  const sequenceLength = clamp(
    start + Math.floor(difficultyFactor(difficulty, 1) - 1),
    start,
    maxLen,
  );

  const [round, setRound] = useState(0);
  const [sequence, setSequence] = useState<number[]>(() => makeSequence(sequenceLength));
  const [flash, setFlash] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('watch');
  const [input, setInput] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    for (const t of timers.current) window.clearTimeout(t);
    timers.current = [];
  }, []);

  useEffect(() => {
    if (phase !== 'watch') return;
    clearTimers();
    sequence.forEach((cell, index) => {
      timers.current.push(
        window.setTimeout(() => setFlash(cell), 600 + index * 650),
        window.setTimeout(() => setFlash(null), 600 + index * 650 + 420),
      );
    });
    timers.current.push(
      window.setTimeout(() => setPhase('recall'), 600 + sequence.length * 650 + 200),
    );
    return clearTimers;
  }, [phase, sequence, clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  function handleTap(cell: number) {
    if (phase !== 'recall') return;
    const nextInput = [...input, cell];
    setInput(nextInput);
    setFlash(cell);
    window.setTimeout(() => setFlash(null), 200);

    if (sequence[nextInput.length - 1] !== cell) {
      setPhase('wrong');
      return;
    }
    if (nextInput.length === sequence.length) {
      setScore((s) => s + sequence.length);
      setPhase('correct');
    }
  }

  function nextRound() {
    setRound((r) => r + 1);
    setSequence(makeSequence(sequenceLength));
    setInput([]);
    setPhase('watch');
  }

  function finishNow() {
    onFinish({
      score,
      maxScore: rounds * sequenceLength,
      completed: true,
      summary: { rounds: round + 1, sequenceLength },
    });
  }

  const isLastRound = round + 1 >= rounds;
  const message =
    phase === 'watch'
      ? 'Watch which flowers light up, one at a time.'
      : phase === 'recall'
        ? `Your turn — tap the ${sequence.length} flowers in the same order.`
        : phase === 'correct'
          ? 'Lovely memory! The garden grew a little more.'
          : 'That order ended early — memories still count. Ready to continue?';

  return (
    <GameShell
      title={game.title}
      roundLabel={`Round ${round + 1} of ${rounds}`}
      progress={round / rounds}
      onExit={onExit}
    >
      <p className="mb-3 text-sm text-muted-foreground" role="status">
        {message}
      </p>

      <div className="mx-auto grid max-w-sm grid-cols-3 gap-3" role="group" aria-label="Flower grid">
        {Array.from({ length: CELLS }).map((_, cell) => (
          <button
            key={cell}
            type="button"
            onClick={() => handleTap(cell)}
            disabled={phase !== 'recall'}
            aria-label={`Flower ${cell + 1}`}
            aria-pressed={flash === cell}
            className={`flex aspect-square items-center justify-center rounded-xl border text-3xl transition-colors focus-visible:outline-2 focus-visible:outline-ring ${
              flash === cell
                ? 'border-primary bg-primary/25'
                : 'border-border bg-card hover:bg-muted disabled:hover:bg-card'
            }`}
          >
            <span aria-hidden="true">{FLOWERS[cell % FLOWERS.length]}</span>
          </button>
        ))}
      </div>

      {phase === 'correct' || phase === 'wrong' ? (
        <div className="mt-4 flex justify-end">
          {isLastRound ? (
            <Button onClick={finishNow}>See my results</Button>
          ) : (
            <Button onClick={nextRound}>Next round</Button>
          )}
        </div>
      ) : null}
    </GameShell>
  );
}
