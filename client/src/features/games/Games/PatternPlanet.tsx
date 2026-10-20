import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GameShell } from '../GameShell';
import { clamp, difficultyFactor, shuffle } from '../gameLogic';
import type { GameComponentProps } from '../types';

const PALETTE = ['🔵', '🟡', '🔴', '🟢', '🟣', '🟠'];

interface Puzzle {
  shown: string[];
  answer: string;
  options: string[];
}

function makePuzzle(difficulty: number): Puzzle {
  const pool = shuffle(PALETTE).slice(0, 3);
  const period = clamp(2 + Math.floor(difficultyFactor(difficulty, 1) - 1), 2, 3);
  const pattern = pool.slice(0, period);
  const length = period * 2 + 1;
  const full = Array.from({ length }, (_, i) => pattern[i % period]);
  const answer = full[full.length - 1];
  const shown = full.slice(0, -1);
  const distractors = shuffle(PALETTE.filter((p) => p !== answer)).slice(0, 2);
  return { shown, answer, options: shuffle([answer, ...distractors]) };
}

export function PatternPlanet({ game, difficulty, onFinish, onExit }: GameComponentProps): React.JSX.Element {
  const rounds = Number(game.settings.rounds ?? 6);

  const [round, setRound] = useState(0);
  const [puzzle, setPuzzle] = useState<Puzzle>(() => makePuzzle(difficulty));
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);

  const isLastRound = round + 1 >= rounds;

  function choose(option: string) {
    if (chosen) return;
    setChosen(option);
    if (option === puzzle.answer) setScore((s) => s + 1);
  }

  function advance() {
    onFinish({
      score,
      maxScore: rounds,
      completed: true,
      summary: { rounds },
    });
  }

  function nextRound() {
    setRound((r) => r + 1);
    setPuzzle(makePuzzle(difficulty));
    setChosen(null);
  }

  return (
    <GameShell
      title={game.title}
      roundLabel={`Round ${round + 1} of ${rounds}`}
      progress={round / rounds}
      onExit={onExit}
    >
      <p className="mb-3 text-sm text-muted-foreground" role="status">
        Study the pattern, then choose what comes next in the empty slot.
      </p>

      <div className="mb-5 flex items-center justify-center gap-2 rounded-xl border border-border bg-card p-6 text-4xl">
        {puzzle.shown.map((item, i) => (
          <span key={i} aria-hidden="true">
            {item}
          </span>
        ))}
        <span className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-dashed border-primary text-muted-foreground">
          ?
        </span>
      </div>

      <div className="flex justify-center gap-3" role="group" aria-label="Answer choices">
        {puzzle.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => choose(option)}
            disabled={chosen !== null}
            aria-label={`Choose ${option}`}
            className={`flex h-14 w-14 items-center justify-center rounded-xl border text-3xl transition-colors focus-visible:outline-2 focus-visible:outline-ring ${
              chosen === option
                ? option === puzzle.answer
                  ? 'border-primary bg-primary/20'
                  : 'border-destructive bg-destructive/10'
                : 'border-border bg-card hover:bg-muted'
            }`}
          >
            <span aria-hidden="true">{option}</span>
          </button>
        ))}
      </div>

      {chosen ? (
        <div className="mt-4 flex justify-end">
          {isLastRound ? (
            <Button onClick={advance}>See my results</Button>
          ) : (
            <Button onClick={nextRound}>Next round</Button>
          )}
        </div>
      ) : null}
    </GameShell>
  );
}
