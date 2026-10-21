import { useState } from 'react';
import { Flame, Sparkles, Trophy } from 'lucide-react';
import { gamesService } from '@/features/games/gamesService';
import { GameCard } from '@/features/games/GameCard';
import type { GameStatsResponse, GameSummary } from '@/features/games/types';
import { useAsync } from '@/hooks/useAsync';
import { Tabs } from '@/components/ui/tabs';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/spinner';
import { PageHeader } from '@/components/layout/PageHeader';

export function GamesPage(): React.JSX.Element {
  const [tab, setTab] = useState('games');
  const { data, error, loading } = useAsync(async () => {
    const [games, stats] = await Promise.all([gamesService.list(), gamesService.stats()]);
    return { games, stats };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="MindPlay"
        description="Short, friendly games for focus, memory, calm and reflection. Play at your own pace — there are no leaderboards and no scores shared with anyone."
      />

      {error ? <Alert variant="error">{error.message}</Alert> : null}
      {loading ? <LoadingState label="Loading games…" /> : null}

      {data ? (
        <Tabs
          value={tab}
          onValueChange={setTab}
          tabs={[
            {
              value: 'games',
              label: 'Play',
              content: <GameGrid games={data.games} statsByCode={data.stats} />,
            },
            {
              value: 'progress',
              label: 'My progress',
              content: <ProgressPanel data={data.stats} />,
            },
          ]}
        />
      ) : null}
    </div>
  );
}

function GameGrid({
  games,
  statsByCode,
}: {
  games: GameSummary[];
  statsByCode: GameStatsResponse;
}): React.JSX.Element {
  if (games.length === 0) {
    return <Alert variant="info">No games are available for your age group yet.</Alert>;
  }
  const statsMap = new Map(statsByCode.stats.map((s) => [s.gameCode, s]));
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {games.map((game) => (
        <GameCard key={game.code} game={game} stats={statsMap.get(game.code)} />
      ))}
    </div>
  );
}

function ProgressPanel({ data }: { data: GameStatsResponse }): React.JSX.Element {
  const { progress, wellness, stats } = data;
  if (stats.length === 0) {
    return (
      <Alert variant="info" role="status">
        You have not played any games yet. Your personal bests will appear here.
      </Alert>
    );
  }
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your wellness journey</CardTitle>
          <CardDescription>Levels grow gently as you play and reflect.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="inline-flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5" aria-hidden="true" /> Level {progress.level}
            </Badge>
            <Badge variant="outline" className="inline-flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> {wellness.xp} XP
            </Badge>
            <Badge variant="outline" className="inline-flex items-center gap-1">
              <Flame className="h-3.5 w-3.5" aria-hidden="true" /> {wellness.streakDays}-day streak
            </Badge>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Progress to level {progress.level + 1}</span>
              <span>
                {progress.xpIntoLevel}/{progress.xpForNextLevel} XP
              </span>
            </div>
            <Progress value={Math.round((progress.xpIntoLevel / progress.xpForNextLevel) * 100)} />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {stats.map((stat) => (
          <Card key={stat.gameCode}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
              <div>
                <p className="font-medium">{stat.title}</p>
                <p className="text-xs text-muted-foreground">
                  {stat.plays} {stat.plays === 1 ? 'play' : 'plays'}
                  {stat.lastPlayedAt
                    ? ` · last ${new Date(stat.lastPlayedAt).toLocaleDateString()}`
                    : ''}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span>
                  <span className="text-muted-foreground">Best </span>
                  {Math.round(stat.bestAccuracy * 100)}%
                </span>
                <span>
                  <span className="text-muted-foreground">XP </span>
                  {stat.totalXp}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
