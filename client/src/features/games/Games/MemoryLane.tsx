import { useEffect, useMemo, useState } from 'react';
import { GameShell } from '../GameShell';
import { clamp, difficultyFactor, shuffle } from '../gameLogic';
import type { GameComponentProps } from '../types';

const ICONS = ['🍎', '🌳', '🏠', '🚲', '☕', '🐈', '🌼', '🎵'];

interface Card {
  id: number;
  icon: string;
}

export function MemoryLane({
  game,
  difficulty,
  onFinish,
  onExit,
}: GameComponentProps): React.JSX.Element {
  const pairsStart = Number(game.settings.pairsStart ?? 3);
  const pairsMax = Number(game.settings.pairsMax ?? 6);
  const pairs = clamp(
    pairsStart + Math.floor(difficultyFactor(difficulty, 1) - 1),
    pairsStart,
    pairsMax,
  );

  const deck = useMemo<Card[]>(() => {
    const chosen = ICONS.slice(0, pairs);
    return shuffle(
      chosen.flatMap((icon, index) => [
        { id: index * 2, icon },
        { id: index * 2 + 1, icon },
      ]),
    );
  }, [pairs]);

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  const totalPairs = pairs;
  const foundPairs = matched.size;

  useEffect(() => {
    if (foundPairs >= totalPairs) {
      onFinish({
        score: totalPairs,
        maxScore: totalPairs,
        completed: true,
        summary: { moves, pairs: totalPairs },
      });
    }
  }, [foundPairs, totalPairs, moves, onFinish]);

  function flip(card: Card) {
    if (locked || flipped.includes(card.id) || matched.has(card.icon)) return;
    const next = [...flipped, card.id];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next.map((id) => deck.find((c) => c.id === id)!);
      if (a.icon === b.icon) {
        setMatched((prev) => new Set(prev).add(a.icon));
        setFlipped([]);
      } else {
        setLocked(true);
        window.setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 800);
      }
    }
  }

  return (
    <GameShell
      title={game.title}
      roundLabel={`Pairs ${foundPairs}/${totalPairs}`}
      progress={foundPairs / totalPairs}
      onExit={onExit}
      footer={<span className="text-xs text-muted-foreground">{moves} moves</span>}
    >
      <p className="mb-3 text-sm text-muted-foreground" role="status">
        Flip two cards at a time to find matching everyday pictures.
      </p>
      <div
        className="mx-auto grid max-w-md grid-cols-3 gap-3 sm:grid-cols-4"
        role="group"
        aria-label="Matching cards"
      >
        {deck.map((card) => {
          const faceUp = flipped.includes(card.id) || matched.has(card.icon);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => flip(card)}
              aria-label={
                faceUp
                  ? `Card ${card.icon}${matched.has(card.icon) ? ', matched' : ', face up'}`
                  : 'Hidden card'
              }
              className={`flex aspect-square items-center justify-center rounded-xl border text-4xl transition-colors focus-visible:outline-2 focus-visible:outline-ring ${
                faceUp ? 'border-primary bg-primary/15' : 'border-border bg-muted hover:bg-muted/70'
              }`}
            >
              {faceUp ? (
                <span aria-hidden="true">{card.icon}</span>
              ) : (
                <span aria-hidden="true">❓</span>
              )}
            </button>
          );
        })}
      </div>
    </GameShell>
  );
}
