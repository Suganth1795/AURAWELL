import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

/**
 * Consistent chrome for every MindPlay game: an exit control, a round/step
 * indicator and a progress bar. Keeps games visually cohesive and accessible.
 */
export function GameShell({
  title,
  roundLabel,
  progress,
  onExit,
  children,
  footer,
}: {
  title: string;
  roundLabel?: string;
  /** 0..1 progress through the current round set. */
  progress?: number;
  onExit: () => void;
  children: ReactNode;
  footer?: ReactNode;
}): React.JSX.Element {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onExit} aria-label="Leave this game">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Leave
        </Button>
        <h2 className="text-base font-semibold">{title}</h2>
        {roundLabel ? (
          <span className="min-w-[6rem] text-right text-xs text-muted-foreground">{roundLabel}</span>
        ) : (
          <span className="min-w-[6rem]" aria-hidden="true" />
        )}
      </div>

      {typeof progress === 'number' ? (
        <Progress value={Math.round(Math.max(0, Math.min(1, progress)) * 100)} />
      ) : null}

      <div>{children}</div>
      {footer ? <div className="flex flex-wrap justify-end gap-3 pt-2">{footer}</div> : null}
    </div>
  );
}
