import { describe, expect, it } from 'vitest';
import {
  applyStreak,
  awardXp,
  levelFromXp,
  levelProgress,
  totalXpForLevel,
  xpForLevel,
} from '../src/services/progress.service.js';
import { dayKeyAdd } from '../src/utils/dates.js';
import type { UserDoc } from '../src/models/index.js';

function fakeUser(wellness: Partial<UserDoc['wellness']> = {}): UserDoc {
  return {
    wellness: {
      xp: 0,
      level: 1,
      streakDays: 0,
      longestStreak: 0,
      lastActiveDay: null,
      avatar: { emoji: '🌱', color: 'violet' },
      ...wellness,
    },
    save: async () => undefined,
  } as unknown as UserDoc;
}

describe('progress.service', () => {
  it('maps XP to levels using the documented curve', () => {
    expect(xpForLevel(1)).toBe(100);
    expect(xpForLevel(2)).toBe(150);
    expect(totalXpForLevel(1)).toBe(0);
    expect(totalXpForLevel(2)).toBe(100);
    expect(totalXpForLevel(3)).toBe(250);

    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(99)).toBe(1);
    expect(levelFromXp(100)).toBe(2);
    expect(levelFromXp(249)).toBe(2);
    expect(levelFromXp(250)).toBe(3);
  });

  it('reports progress within the current level', () => {
    const p = levelProgress(120);
    expect(p.level).toBe(2);
    expect(p.xpIntoLevel).toBe(20);
    expect(p.xpForNextLevel).toBe(150);
  });

  it('awards XP and reports level-ups', () => {
    const user = fakeUser({ xp: 90, level: 1 });
    const result = awardXp(user, 20);
    expect(result).toMatchObject({ awarded: 20, xp: 110, level: 2, leveledUp: true });
    expect(user.wellness.xp).toBe(110);
  });

  it('ignores negative XP and rounds fractional values', () => {
    const user = fakeUser({ xp: 50, level: 1 });
    awardXp(user, -100);
    expect(user.wellness.xp).toBe(50);
    awardXp(user, 12.6);
    expect(user.wellness.xp).toBe(63);
  });

  it('starts a streak on the first active day', () => {
    const user = fakeUser();
    const result = applyStreak(user, '2026-10-20');
    expect(result).toMatchObject({ streakDays: 1, longestStreak: 1, extended: false });
    expect(user.wellness.lastActiveDay).toBe('2026-10-20');
  });

  it('increments the streak on the following day and resets after a gap', () => {

    const user = fakeUser({ streakDays: 3, longestStreak: 3, lastActiveDay: '2026-10-19' });
    const next = applyStreak(user, '2026-10-20');
    expect(next).toMatchObject({ streakDays: 4, longestStreak: 4, extended: true });

    const sameDay = applyStreak(user, '2026-10-20');
    expect(sameDay.streakDays).toBe(4);
    expect(sameDay.extended).toBe(false);

    const gap = applyStreak(user, '2026-10-25');
    expect(gap).toMatchObject({ streakDays: 1, longestStreak: 4, extended: false });
  });

  it('keeps the longest streak even when the current streak resets', () => {
    const user = fakeUser({ streakDays: 10, longestStreak: 10, lastActiveDay: dayKeyAdd('2026-10-01', 0) });
    const result = applyStreak(user, '2026-10-20');
    expect(result.streakDays).toBe(1);
    expect(result.longestStreak).toBe(10);
  });
});
