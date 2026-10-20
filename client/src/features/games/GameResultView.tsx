import { Link } from 'react-router-dom';
import { Sparkles, Flame, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import type { GameReward, GameSession, LevelProgress } from './types';

export function GameResultView({
  gameTitle,
  session,
  reward,
  progress,
  duplicate,
}: {
  gameTitle: string;
  session: GameSession;
  reward: GameReward;
  progress: LevelProgress;
  duplicate: boolean;
}): React.JSX.Element {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" aria-hidden="true" />
            <CardTitle>Nice playing — {gameTitle}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Score" value={`${session.score} / ${session.maxScore}`} />
            <Stat label="Accuracy" value={`${Math.round(session.accuracy * 100)}%`} />
            <Stat label="Time" value={`${Math.round(session.durationSeconds)}s`} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {duplicate ? (
              <Badge variant="secondary">Already counted — no extra XP</Badge>
            ) : (
              <Badge variant="secondary" className="inline-flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />+{reward.awardedXp} XP
              </Badge>
            )}
            {reward.streakExtended ? (
              <Badge variant="outline" className="inline-flex items-center gap-1">
                <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                {reward.streakDays}-day streak
              </Badge>
            ) : null}
            {reward.leveledUp ? <Badge>Level {reward.level}!</Badge> : null}
          </div>

          <div>
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Level {progress.level}</span>
              <span>
                {progress.xpIntoLevel}/{progress.xpForNextLevel} XP
              </span>
            </div>
            <Progress value={Math.round((progress.xpIntoLevel / progress.xpForNextLevel) * 100)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link to="/games" className={cn(buttonVariants({ variant: 'default' }))}>
          Back to MindPlay
        </Link>
        <Link to="/analytics" className={cn(buttonVariants({ variant: 'outline' }))}>
          See my progress
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
