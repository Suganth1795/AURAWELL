import { useAuthStore } from '@/stores/auth';

interface RewardLike {
  xp: number;
  level: number;
  streakDays: number;
  longestStreak: number;
}

/**
 * Applies a reward returned by a wellness-logging or game endpoint to the cached
 * user so the shell's XP/level/streak badges update immediately without a
 * re-fetch.
 */
export function useApplyReward(): (reward: RewardLike | null) => void {
  return (reward) => {
    if (!reward) return;
    const { user, setUser } = useAuthStore.getState();
    if (!user) return;
    setUser({
      ...user,
      wellness: {
        ...user.wellness,
        xp: reward.xp,
        level: reward.level,
        streakDays: reward.streakDays,
        longestStreak: reward.longestStreak,
      },
    });
  };
}
