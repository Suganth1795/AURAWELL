import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { GameShell } from '../GameShell';
import type { GameComponentProps } from '../types';

export function CalmDragon({ game, onFinish, onExit }: GameComponentProps): React.JSX.Element {
  const breathIn = Number(game.settings.breathIn ?? 4);
  const breathOut = Number(game.settings.breathOut ?? 6);
  const cycles = Number(game.settings.cycles ?? 6);
  const cycleSeconds = breathIn + breathOut;
  const totalSeconds = cycles * cycleSeconds;

  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);
  const timer = useRef<number | null>(null);

  // A single ticking clock; phase, cycle and countdown are all derived from it.
  useEffect(() => {
    if (!running) return;
    timer.current = window.setInterval(() => {
      setTick((t) => {
        const next = t + 1;
        if (next >= totalSeconds) {
          setRunning(false);
          onFinish({
            score: cycles,
            maxScore: cycles,
            completed: true,
            summary: { cycles, breathIn, breathOut },
          });
          return totalSeconds;
        }
        return next;
      });
    }, 1000);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [running, totalSeconds, cycles, breathIn, breathOut, onFinish]);

  const done = tick >= totalSeconds;
  const cycle = Math.min(Math.floor(tick / cycleSeconds), cycles);
  const intoCycle = tick % cycleSeconds;
  const growing = intoCycle < breathIn;
  const secondsLeft = growing ? breathIn - intoCycle : cycleSeconds - intoCycle;

  const progress = Math.min(1, tick / totalSeconds);
  const shownCycle = Math.min(cycle + 1, cycles);

  return (
    <GameShell
      title={game.title}
      roundLabel={`Breath ${shownCycle} of ${cycles}`}
      progress={progress}
      onExit={onExit}
      footer={
        done ? (
          <span className="text-sm text-muted-foreground">All done — lovely and calm.</span>
        ) : running ? (
          <Button variant="outline" onClick={() => setRunning(false)}>
            Pause
          </Button>
        ) : (
          <Button onClick={() => setRunning(true)}>
            {tick > 0 ? 'Keep breathing' : 'Begin'}
          </Button>
        )
      }
    >
      <p className="mb-4 text-sm text-muted-foreground">
        Breathe in as the dragon grows, and out slowly as it settles. Follow at your own pace.
      </p>

      <div className="flex flex-col items-center gap-4 py-6">
        <div
          className="flex items-center justify-center text-7xl transition-transform duration-[3000ms] ease-in-out motion-reduce:transition-none"
          style={{ transform: `scale(${running && growing ? 1.25 : 0.85})` }}
          aria-hidden="true"
        >
          🐉
        </div>
        <p className="text-lg font-medium" aria-live="polite">
          {running ? (growing ? 'Breathe in…' : 'Breathe out…') : done ? 'Well done.' : 'Ready when you are.'}
        </p>
        <p className="text-3xl font-semibold tabular-nums" aria-hidden="true">
          {running ? Math.max(0, secondsLeft) : breathIn}
        </p>
      </div>
    </GameShell>
  );
}
