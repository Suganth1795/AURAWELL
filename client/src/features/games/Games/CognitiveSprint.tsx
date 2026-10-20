import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GameShell } from '../GameShell';
import { pickRandom, shuffle } from '../gameLogic';
import type { GameComponentProps } from '../types';

type MiniRound =
  | { kind: 'odd-one-out'; prompt: string; options: string[]; answer: string }
  | { kind: 'math'; prompt: string; options: number[]; answer: number };

function makeRound(): MiniRound {
  const useMath = Math.random() < 0.5;
  if (useMath) {
    const a = 2 + Math.floor(Math.random() * 9);
    const b = 2 + Math.floor(Math.random() * 9);
    const answer = a + b;
    const options = shuffle([answer, answer + 1, answer - 1, answer + 2]).slice(0, 4);
    if (!options.includes(answer)) options[0] = answer;
    return { kind: 'math', prompt: `${a} + ${b} = ?`, options: shuffle(options), answer };
  }
  const groups = [
    { items: ['🍎', '🍌', '🍇', '🍓'], odd: '🚗' },
    { items: ['🐶', '🐱', '🐰', '🐹'], odd: '🚲' },
    { items: ['🌷', '🌻', '🌼', '🌹'], odd: '⚽' },
  ];
  const group = pickRandom(groups);
  const options = shuffle([...group.items, group.odd]);
  return { kind: 'odd-one-out', prompt: 'Which one does not belong?', options, answer: group.odd };
}

export function CognitiveSprint({ game, onFinish, onExit }: GameComponentProps): React.JSX.Element {
  const rounds = Number(game.settings.rounds ?? 6);

  const [round, setRound] = useState(0);
  const [question, setQuestion] = useState<MiniRound>(makeRound);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);

  function choose(value: string, correct: boolean) {
    if (chosen) return;
    setChosen(value);
    if (correct) setScore((s) => s + 1);
  }

  function next() {
    if (round + 1 >= rounds) {
      onFinish({ score, maxScore: rounds, completed: true, summary: { rounds } });
      return;
    }
    setRound((r) => r + 1);
    setQuestion(makeRound());
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
        A short mental warm-up. Accuracy matters more than speed — take your time.
      </p>

      <div className="mb-4 rounded-xl border border-border bg-card p-4 text-center text-lg font-medium">
        {question.prompt}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="group" aria-label="Answer options">
        {question.options.map((option) => {
          const value = String(option);
          const isAnswer = value === String(question.answer);
          return (
            <button
              key={value}
              type="button"
              onClick={() => choose(value, isAnswer)}
              disabled={chosen !== null}
              aria-label={`Choose ${value}`}
              className={`flex h-16 items-center justify-center rounded-xl border text-2xl font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-ring ${
                chosen === value
                  ? isAnswer
                    ? 'border-primary bg-primary/20'
                    : 'border-destructive bg-destructive/10'
                  : 'border-border bg-card hover:bg-muted'
              }`}
            >
              {value}
            </button>
          );
        })}
      </div>

      {chosen ? (
        <div className="mt-4 flex justify-end">
          <Button onClick={next}>{round + 1 >= rounds ? 'See my results' : 'Next round'}</Button>
        </div>
      ) : null}
    </GameShell>
  );
}
