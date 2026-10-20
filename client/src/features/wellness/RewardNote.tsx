import { Sparkles, Flame } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import type { RewardSummary } from './types';

/** Gentle, non-competitive acknowledgement of a logged entry. */
export function RewardNote({ reward }: { reward: RewardSummary }): React.JSX.Element {
  return (
    <Alert variant="success" role="status" className="text-sm">
      <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
        {reward.xpAwarded > 0 ? (
          <span className="inline-flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> +{reward.xpAwarded} XP
          </span>
        ) : (
          <span>Already logged today — thanks for checking in.</span>
        )}
        <span className="inline-flex items-center gap-1">
          <Flame className="h-3.5 w-3.5" aria-hidden="true" /> {reward.streakDays}-day streak
        </span>
        {reward.leveledUp ? <span>Level up — you reached level {reward.level}!</span> : null}
      </span>
    </Alert>
  );
}
