import type { UserDoc } from '../models/index.js';
import { dayKey, dayKeyAdd } from '../utils/dates.js';

/** XP needed to advance from `level` to the next level. Gentle, non-competitive curve. */
export function xpForLevel(level: number): number {
  return 100 + (level - 1) * 50;
}

/** Total XP required to have reached `level` from level 1. */
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l++) total += xpForLevel(l);
  return total;
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (xp >= totalXpForLevel(level + 1) && level < 999) level++;
  return level;
}

export interface LevelProgress {
  xp: number;
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
}

export function levelProgress(xp: number): LevelProgress {
  const level = levelFromXp(xp);
  const base = totalXpForLevel(level);
  const next = xpForLevel(level);
  return { xp, level, xpIntoLevel: xp - base, xpForNextLevel: next };
}

/**
 * Updates the daily streak based on the last active calendar day (UTC).
 * Same day keeps the streak; the immediately preceding day increments it;
 * any gap resets it to 1.
 */
export function applyStreak(
  user: UserDoc,
  today: string = dayKey(),
): { streakDays: number; longestStreak: number; extended: boolean } {
  const last = user.wellness.lastActiveDay;
  let streak: number;
  let extended = false;

  if (!last) {
    streak = 1;
  } else if (last === today) {
    streak = user.wellness.streakDays > 0 ? user.wellness.streakDays : 1;
  } else if (last === dayKeyAdd(today, -1)) {
    streak = user.wellness.streakDays + 1;
    extended = true;
  } else {
    streak = 1;
  }

  const longest = Math.max(user.wellness.longestStreak, streak);
  user.wellness.streakDays = streak;
  user.wellness.longestStreak = longest;
  user.wellness.lastActiveDay = today;
  return { streakDays: streak, longestStreak: longest, extended };
}

/** Adds XP to the user, recomputes level, and reports whether a level-up occurred. */
export function awardXp(
  user: UserDoc,
  amount: number,
): { awarded: number; xp: number; level: number; leveledUp: boolean } {
  const safeAmount = Math.max(0, Math.round(amount));
  const previousLevel = user.wellness.level;
  const xp = user.wellness.xp + safeAmount;
  const level = levelFromXp(xp);
  user.wellness.xp = xp;
  user.wellness.level = level;
  return { awarded: safeAmount, xp, level, leveledUp: level > previousLevel };
}
