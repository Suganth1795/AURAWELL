import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Sparkles, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { GameDetail } from './types';

const DIFFICULTY_LABELS = ['Gentle', 'Easy', 'Steady', 'Brisk', 'Challenging'];

export function GameIntro({
  game,
  difficulty,
  onDifficultyChange,
  onStart,
  onBack,
}: {
  game: GameDetail;
  difficulty: number;
  onDifficultyChange: (value: number) => void;
  onStart: () => void;
  onBack: () => void;
}): React.JSX.Element {
  return (
    <div className="space-y-5">
      <Link
        to="/games"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to MindPlay
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle>{game.title}</CardTitle>
            <Badge variant="secondary" className="capitalize">
              {game.skill}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground">{game.description}</p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />~{game.estimatedMinutes} min
            </span>
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              up to {game.maxXp} XP
            </span>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="inline-flex items-center gap-1.5 text-sm font-medium">
              <Info className="h-4 w-4" aria-hidden="true" /> How to play
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{game.instructions}</p>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">Choose your pace</legend>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTY_LABELS.map((label, index) => {
                const value = index + 1;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => onDifficultyChange(value)}
                    aria-pressed={difficulty === value}
                    className={`rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-ring ${
                      difficulty === value
                        ? 'border-primary bg-primary/15'
                        : 'border-border bg-card hover:bg-muted'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-3">
            <Button onClick={onStart}>Start playing</Button>
            <Button variant="outline" onClick={onBack}>
              Not now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
