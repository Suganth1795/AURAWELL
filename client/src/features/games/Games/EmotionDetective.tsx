import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GameShell } from '../GameShell';
import { shuffle } from '../gameLogic';
import type { GameComponentProps } from '../types';

interface Scenario {
  text: string;
  feeling: string;
  emoji: string;
}

const EMOTIONS = [
  { feeling: 'happy', emoji: '😊' },
  { feeling: 'sad', emoji: '😢' },
  { feeling: 'worried', emoji: '😟' },
  { feeling: 'angry', emoji: '😠' },
  { feeling: 'calm', emoji: '😌' },
  { feeling: 'excited', emoji: '🤩' },
];

const SCENARIOS: Scenario[] = [
  { text: 'Maya opened a present she had waited for all week.', feeling: 'excited', emoji: '🎁' },
  { text: 'Sam said goodbye to a friend who moved far away.', feeling: 'sad', emoji: '👋' },
  { text: 'Look at the lake and breathe slowly in the morning sun.', feeling: 'calm', emoji: '🌅' },
  { text: 'Leo worked hard on a drawing and his teacher loved it.', feeling: 'happy', emoji: '🎨' },
  { text: 'Nia has a big test tomorrow and her tummy flutters.', feeling: 'worried', emoji: '📚' },
  { text: 'Someone took riya’s turn without asking.', feeling: 'angry', emoji: '🎲' },
  { text: 'The family got together for a warm meal and stories.', feeling: 'happy', emoji: '🍲' },
  { text: 'Kai watched the storm clouds grow darker and darker.', feeling: 'worried', emoji: '⛈️' },
];

function makeQuestion(): { scenario: Scenario; options: { feeling: string; emoji: string }[] } {
  const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
  const correct = EMOTIONS.find((e) => e.feeling === scenario.feeling)!;
  const distractors = shuffle(EMOTIONS.filter((e) => e.feeling !== scenario.feeling)).slice(0, 2);
  return { scenario, options: shuffle([correct, ...distractors]) };
}

export function EmotionDetective({ game, onFinish, onExit }: GameComponentProps): React.JSX.Element {
  const rounds = Number(game.settings.rounds ?? 5);

  const [round, setRound] = useState(0);
  const [question, setQuestion] = useState(makeQuestion);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);

  function choose(feeling: string) {
    if (chosen) return;
    setChosen(feeling);
    if (feeling === question.scenario.feeling) setScore((s) => s + 1);
  }

  function next() {
    if (round + 1 >= rounds) {
      onFinish({
        score,
        maxScore: rounds,
        completed: true,
        summary: { rounds },
      });
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
        There is no wrong feeling to have — this is just a friendly guess about the story.
      </p>

      <div className="mb-4 rounded-xl border border-border bg-card p-4">
        <p className="text-base">
          <span className="mr-2 text-2xl" aria-hidden="true">
            {question.scenario.emoji}
          </span>
          {question.scenario.text}
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3" role="group" aria-label="Feeling choices">
        {question.options.map((option) => (
          <button
            key={option.feeling}
            type="button"
            onClick={() => choose(option.feeling)}
            disabled={chosen !== null}
            aria-label={`Feeling: ${option.feeling}`}
            className={`flex items-center gap-2 rounded-lg border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-ring ${
              chosen === option.feeling
                ? option.feeling === question.scenario.feeling
                  ? 'border-primary bg-primary/15'
                  : 'border-destructive bg-destructive/10'
                : 'border-border bg-card hover:bg-muted'
            }`}
          >
            <span className="text-2xl" aria-hidden="true">
              {option.emoji}
            </span>
            <span className="capitalize">{option.feeling}</span>
          </button>
        ))}
      </div>

      {chosen ? (
        <div className="mt-4 flex justify-end">
          <Button onClick={next}>{round + 1 >= rounds ? 'See my results' : 'Next situation'}</Button>
        </div>
      ) : null}
    </GameShell>
  );
}
