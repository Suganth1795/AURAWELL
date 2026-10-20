import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GameShell } from '../GameShell';
import { shuffle } from '../gameLogic';
import type { GameComponentProps } from '../types';

interface WordEntry {
  word: string;
  clue: string;
  emoji: string;
}

const WORDS: WordEntry[] = [
  { word: 'GARDEN', clue: 'Where flowers and vegetables grow', emoji: '🌻' },
  { word: 'SUNSET', clue: 'When the sky turns warm colours at day’s end', emoji: '🌅' },
  { word: 'FRIEND', clue: 'Someone you like to spend time with', emoji: '🤝' },
  { word: 'BREATH', clue: 'What you take in slowly to feel calm', emoji: '😮💨' },
  { word: 'MEMORY', clue: 'Something you remember from the past', emoji: '💭' },
  { word: 'MUSIC', clue: 'Sounds you enjoy listening to', emoji: '🎵' },
  { word: 'COFFEE', clue: 'A warm drink many people have in the morning', emoji: '☕' },
  { word: 'WALK', clue: 'Moving on foot at a gentle pace', emoji: '🚶' },
  { word: 'SMILE', clue: 'A happy shape your mouth can make', emoji: '😊' },
  { word: 'LIGHT', clue: 'What a lamp gives off in a dark room', emoji: '💡' },
];

function makeQuestion(): { entry: WordEntry; letters: string[] } {
  const entry = WORDS[Math.floor(Math.random() * WORDS.length)];
  return { entry, letters: shuffle(entry.word.split('')) };
}

export function WordGarden({ game, onFinish, onExit }: GameComponentProps): React.JSX.Element {
  const rounds = Number(game.settings.rounds ?? 5);

  const [round, setRound] = useState(0);
  const [question, setQuestion] = useState(makeQuestion);
  const [built, setBuilt] = useState<string[]>([]);
  const [used, setUsed] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);

  // The word is solved as soon as the built letters match — no effect needed.
  const revealed = built.join('') === question.entry.word;

  function addLetter(index: number) {
    if (used.has(index) || revealed) return;
    setBuilt((b) => [...b, question.letters[index]]);
    setUsed((prev) => new Set(prev).add(index));
  }

  function clear() {
    setBuilt([]);
    setUsed(new Set());
  }

  function next() {
    const roundScore = revealed ? 1 : 0;
    if (round + 1 >= rounds) {
      onFinish({
        score: score + roundScore,
        maxScore: rounds,
        completed: true,
        summary: { rounds },
      });
      return;
    }
    setScore((s) => s + roundScore);
    setRound((r) => r + 1);
    setQuestion(makeQuestion());
    setBuilt([]);
    setUsed(new Set());
  }

  return (
    <GameShell
      title={game.title}
      roundLabel={`Round ${round + 1} of ${rounds}`}
      progress={round / rounds}
      onExit={onExit}
      footer={
        revealed ? (
          <Button onClick={next}>{round + 1 >= rounds ? 'See my results' : 'Next word'}</Button>
        ) : (
          <Button variant="outline" onClick={clear} disabled={built.length === 0}>
            Clear
          </Button>
        )
      }
    >
      <div className="mb-4 rounded-xl border border-border bg-card p-4 text-center">
        <p className="text-3xl" aria-hidden="true">
          {question.entry.emoji}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{question.entry.clue}</p>
      </div>

      <div
        className="mb-4 flex min-h-14 items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-2xl font-semibold tracking-widest"
        aria-live="polite"
        aria-label={`Your word: ${built.join('') || 'empty'}`}
      >
        {built.length > 0 ? built.join('') : <span className="text-muted-foreground">…</span>}
      </div>

      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Available letters">
        {question.letters.map((letter, index) => (
          <button
            key={`${letter}-${index}`}
            type="button"
            onClick={() => addLetter(index)}
            disabled={used.has(index) || revealed}
            aria-label={`Letter ${letter}`}
            className={`flex h-12 w-12 items-center justify-center rounded-lg border text-xl font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-ring ${
              used.has(index)
                ? 'border-border bg-muted/40 text-muted-foreground opacity-50'
                : 'border-border bg-card hover:bg-muted'
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {revealed ? (
        <p className="mt-3 text-center text-sm text-primary" role="status">
          Lovely — “{question.entry.word}” it is!
        </p>
      ) : null}
    </GameShell>
  );
}
