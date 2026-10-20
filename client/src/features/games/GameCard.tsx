import { Link } from 'react-router-dom';
import { Clock, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import type { GameStats, GameSummary } from './types';

export function GameCard({
  game,
  stats,
}: {
  game: GameSummary;
  stats?: GameStats;
}): React.JSX.Element {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>{game.title}</CardTitle>
          <Badge variant="secondary" className="capitalize">
            {game.skill}
          </Badge>
        </div>
        <CardDescription>{game.description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />~{game.estimatedMinutes} min
          </span>
          <span className="inline-flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            up to {game.maxXp} XP
          </span>
          {stats && stats.plays > 0 ? (
            <span>Best: {Math.round(stats.bestAccuracy * 100)}%</span>
          ) : null}
        </div>
        <Link
          to={`/games/${game.code}`}
          className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
        >
          {stats && stats.plays > 0 ? 'Play again' : 'Play'}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  );
}
