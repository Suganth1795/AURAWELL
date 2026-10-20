import type { UserDoc } from '../models/index.js';
import { applyStreak, awardXp } from './progress.service.js';

/**
 * Marks a day as active for the user (streak) and grants a small XP reward for
 * logging wellness data. Deliberately low-value so tracking stays gentle and
 * non-competitive; games remain the main XP source.
 */
export const WELLNESS_LOG_XP = 5;

export interface TouchResult {
  xpAwarded: number;
  xp: number;
  level: number;
  leveledUp: boolean;
  streakDays: number;
  longestStreak: number;
  streakExtended: boolean;
}

/**
 * Records daily activity. The XP for a given calendar day is only granted once
 * per day so repeated logging does not farm points; the streak still refreshes.
 */
export async function touchDailyActivity(
  user: UserDoc,
  options: { awardXp?: boolean; amount?: number } = {},
): Promise<TouchResult> {
  const today = new Date().toISOString().slice(0, 10);
  const alreadyActiveToday = user.wellness.lastActiveDay === today;
  const streak = applyStreak(user, today);

  const wantsXp = options.awardXp ?? true;
  const amount = wantsXp && !alreadyActiveToday ? (options.amount ?? WELLNESS_LOG_XP) : 0;
  const xpResult = awardXp(user, amount);

  await user.save();

  return {
    xpAwarded: xpResult.awarded,
    xp: xpResult.xp,
    level: xpResult.level,
    leveledUp: xpResult.leveledUp,
    streakDays: streak.streakDays,
    longestStreak: streak.longestStreak,
    streakExtended: streak.extended,
  };
}
