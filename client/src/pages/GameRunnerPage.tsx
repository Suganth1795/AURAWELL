import { useCallback, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert } from '@/components/ui/alert';
import { LoadingState } from '@/components/ui/spinner';
import { useAsync } from '@/hooks/useAsync';
import { ApiError } from '@/services/api';
import { gamesService, newIdempotencyKey } from '@/features/games/gamesService';
import { GameStage } from '@/features/games/GameStage';
import { GameIntro } from '@/features/games/GameIntro';
import { GameResultView } from '@/features/games/GameResultView';
import type { GameOutcome, GameSubmitResponse } from '@/features/games/types';

type Stage = 'intro' | 'playing' | 'result';

export function GameRunnerPage(): React.JSX.Element | null {
  const { code = '' } = useParams();
  const navigate = useNavigate();

  const { data: game, error: loadError, loading } = useAsync(() => gamesService.get(code), [code]);

  const [stage, setStage] = useState<Stage>('intro');
  const [difficulty, setDifficulty] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<GameSubmitResponse | null>(null);
  const roundKey = useRef<string>(newIdempotencyKey(code));
  const startedAt = useRef<number>(0);

  const handleFinish = useCallback(
    async (outcome: GameOutcome) => {
      if (!game) return;
      setSubmitting(true);
      setSubmitError(null);
      const durationSeconds = Math.max(
        1,
        Math.round((Date.now() - startedAt.current) / 1000),
      );
      try {
        const response = await gamesService.submit({
          gameCode: game.code,
          difficulty,
          score: outcome.score,
          maxScore: outcome.maxScore,
          durationSeconds,
          completed: outcome.completed,
          summary: outcome.summary,
          idempotencyKey: roundKey.current,
        });
        setResult(response);
        setStage('result');
      } catch (e) {
        setSubmitError(e instanceof Error ? e.message : 'Could not save your game result');
      } finally {
        setSubmitting(false);
      }
    },
    [game, difficulty],
  );

  function start() {
    roundKey.current = newIdempotencyKey(code);
    startedAt.current = Date.now();
    setStage('playing');
  }

  if (loading) return <LoadingState label="Loading game…" />;

  if (loadError) {
    const message =
      loadError instanceof ApiError && loadError.status === 403
        ? 'This game is not available for your age group.'
        : loadError instanceof ApiError && loadError.status === 404
          ? 'This game could not be found.'
          : loadError.message;
    return (
      <div className="space-y-4">
        <Alert variant="error">{message}</Alert>
        <Link to="/games" className="text-sm text-primary underline">
          Back to MindPlay
        </Link>
      </div>
    );
  }

  if (!game) return null;
  if (stage === 'result' && result) {
    return (
      <GameResultView
        gameTitle={game.title}
        session={result.session}
        reward={result.reward}
        progress={result.progress}
        duplicate={result.duplicate}
      />
    );
  }

  if (stage === 'intro') {
    return (
      <GameIntro
        game={game}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        onStart={start}
        onBack={() => navigate('/games')}
      />
    );
  }

  return (
    <div className="space-y-4">
      {submitError ? <Alert variant="error">{submitError}</Alert> : null}
      <GameStage
        game={game}
        difficulty={difficulty}
        onFinish={handleFinish}
        onExit={() => navigate('/games')}
      />
      {submitting ? <LoadingState label="Saving your result…" /> : null}
    </div>
  );
}
