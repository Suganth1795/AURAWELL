import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GameShell } from '../GameShell';
import { shuffle } from '../gameLogic';
import type { GameComponentProps } from '../types';

interface Reframe {
  thought: string;
  options: { text: string; kinder: boolean }[];
}

const SCENARIOS: Reframe[] = [
  {
    thought: 'I got one question wrong, so I am bad at this subject.',
    options: [
      { text: 'One mistake is a clue about what to practise, not who I am.', kinder: true },
      { text: 'I will never be good at anything.', kinder: false },
      { text: 'Getting one wrong means I should give up.', kinder: false },
    ],
  },
  {
    thought: 'My friend did not reply quickly, so they must be upset with me.',
    options: [
      { text: 'They might be busy — I can check in kindly when I am ready.', kinder: true },
      { text: 'They definitely hate me now.', kinder: false },
      { text: 'I should never message anyone again.', kinder: false },
    ],
  },
  {
    thought: 'I felt nervous speaking up, so I am weak.',
    options: [
      { text: 'Feeling nervous is normal; speaking up anyway took courage.', kinder: true },
      { text: 'I am weak and everyone noticed.', kinder: false },
      { text: 'I should never speak up again.', kinder: false },
    ],
  },
  {
    thought: 'I did not finish everything today, so the whole day was wasted.',
    options: [
      { text: 'I did some things well — I can choose one small next step.', kinder: true },
      { text: 'The day was a total failure.', kinder: false },
      { text: 'There is no point trying tomorrow.', kinder: false },
    ],
  },
  {
    thought: 'I made a mistake in front of others, so they will always remember it.',
    options: [
      { text: 'Most people move on quickly; mistakes are human and passing.', kinder: true },
      { text: 'Everyone will think about it forever.', kinder: false },
      { text: 'I should hide from people now.', kinder: false },
    ],
  },
];

interface Question {
  thought: string;
  options: { text: string; kinder: boolean }[];
}

function makeQuestion(): Question {
  const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
  return { thought: scenario.thought, options: shuffle(scenario.options) };
}

export function ThoughtDetective({ game, onFinish, onExit }: GameComponentProps): React.JSX.Element {
  const rounds = Number(game.settings.rounds ?? 4);

  const [round, setRound] = useState(0);
  const [question, setQuestion] = useState(makeQuestion);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);

  function choose(text: string, kinder: boolean) {
    if (chosen) return;
    setChosen(text);
    if (kinder) setScore((s) => s + 1);
  }

  function next() {
    if (round + 1 >= rounds) {
      onFinish({ score, maxScore: rounds, completed: true, summary: { rounds } });
      return;
    }
    setRound((r) => r + 1);
    setQuestion(makeQuestion());
    setChosen(null);
  }

  return (
    <GameShell
      title={game.title}
      roundLabel={`Round ${round + 1} of ${rounds}`}
      progress={round / rounds}
      onExit={onExit}
    >
      <p className="mb-3 text-sm text-muted-foreground">
        Pick the kindest, most balanced way to look at the thought. This is a practice, not a test.
      </p>

      <div className="mb-4 rounded-xl border border-border bg-muted/40 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">A thought to explore</p>
        <p className="mt-1 text-base italic">“{question.thought}”</p>
      </div>

      <div className="space-y-2" role="group" aria-label="Reframe choices">
        {question.options.map((option) => (
          <button
            key={option.text}
            type="button"
            onClick={() => choose(option.text, option.kinder)}
            disabled={chosen !== null}
            className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-ring ${
              chosen === option.text
                ? option.kinder
                  ? 'border-primary bg-primary/15'
                  : 'border-destructive bg-destructive/10'
                : 'border-border bg-card hover:bg-muted'
            }`}
          >
            {option.text}
          </button>
        ))}
      </div>

      {chosen ? (
        <div className="mt-4 flex justify-end">
          <Button onClick={next}>{round + 1 >= rounds ? 'See my results' : 'Next thought'}</Button>
        </div>
      ) : null}
    </GameShell>
  );
}
