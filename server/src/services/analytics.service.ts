import {
  ActivityEntry,
  AssessmentResponse,
  GameSession,
  Habit,
  HabitEntry,
  JournalEntry,
  MoodEntry,
  MOOD_SCORE,
  SleepEntry,
  type MoodValue,
  type UserDoc,
} from '../models/index.js';
import { levelProgress } from './progress.service.js';
import { dayKey, lastNDays } from '../utils/dates.js';

const TREND_DAYS = 14;

export interface TrendPoint {
  dayKey: string;
  value: number | null;
}

export interface AnalyticsOverview {
  range: { days: number; from: string; to: string };
  wellness: {
    xp: number;
    level: number;
    xpIntoLevel: number;
    xpForNextLevel: number;
    streakDays: number;
    longestStreak: number;
  };
  totals: {
    assessments: number;
    gameSessions: number;
    moodEntries: number;
    journalEntries: number;
    sleepNights: number;
    activitySessions: number;
    habitCheckIns: number;
  };
  mood: {
    averageScore: number | null;
    entriesLogged: number;
    trend: TrendPoint[];
  };
  sleep: {
    averageDurationMinutes: number | null;
    averageQuality: number | null;
    nightsLogged: number;
    trend: TrendPoint[];
  };
  activity: {
    totalMinutes: number;
    sessions: number;
    activeDays: number;
    trend: TrendPoint[];
  };
  habits: {
    activeHabits: number;
    completionsLast7Days: number;
    bestStreak: number;
  };
  latestAssessment: {
    id: string;
    code: string;
    summary: string;
    priorities: string[];
    indicators: Record<string, number>;
    completedAt: string;
  } | null;
}

/**
 * Aggregates the user's own wellness records into a single non-diagnostic
 * overview. Every figure is a descriptive count or average of what the user
 * logged; nothing here interprets or diagnoses a condition.
 */
export async function getAnalyticsOverview(user: UserDoc, days = TREND_DAYS): Promise<AnalyticsOverview> {
  const keys = lastNDays(days);
  const from = keys[0];
  const userId = user._id;

  const [
    assessmentCount,
    gameSessionCount,
    moodEntries,
    journalCount,
    sleepEntries,
    activityEntries,
    habits,
    habitCompletions,
    latestAssessment,
  ] = await Promise.all([
    AssessmentResponse.countDocuments({ userId }),
    GameSession.countDocuments({ userId }),
    MoodEntry.find({ userId, dayKey: { $gte: from } }).select('dayKey mood'),
    JournalEntry.countDocuments({ userId, deletedAt: null }),
    SleepEntry.find({ userId, dayKey: { $gte: from } }).select('dayKey durationMinutes quality'),
    ActivityEntry.find({ userId, dayKey: { $gte: from } }).select('dayKey durationMinutes'),
    Habit.find({ userId, deletedAt: null, archived: false }).select('_id'),
    HabitEntry.find({ userId, dayKey: { $gte: from }, completed: true }).select('habitId dayKey'),
    AssessmentResponse.findOne({ userId }).sort({ completedAt: -1 }).select(
      'assessmentCode summary priorities indicators completedAt',
    ),
  ]);

  const totalHabitCheckIns = await HabitEntry.countDocuments({ userId, completed: true });

  const moodBuckets = new Map<string, number[]>();
  for (const entry of moodEntries) {
    const list = moodBuckets.get(entry.dayKey) ?? [];
    list.push(MOOD_SCORE[entry.mood as MoodValue]);
    moodBuckets.set(entry.dayKey, list);
  }

  const sleepByDay = new Map<string, { duration: number; quality: number }>();
  for (const entry of sleepEntries) {
    const existing = sleepByDay.get(entry.dayKey) ?? { duration: 0, quality: 0 };
    existing.duration += entry.durationMinutes;
    existing.quality = Math.max(existing.quality, entry.quality);
    sleepByDay.set(entry.dayKey, existing);
  }

  const activityByDay = new Map<string, number>();
  for (const entry of activityEntries) {
    activityByDay.set(entry.dayKey, (activityByDay.get(entry.dayKey) ?? 0) + entry.durationMinutes);
  }

  const moodTrend: TrendPoint[] = keys.map((key) => {
    const scores = moodBuckets.get(key);
    if (!scores || scores.length === 0) return { dayKey: key, value: null };
    const avg = scores.reduce((sum, value) => sum + value, 0) / scores.length;
    return { dayKey: key, value: Math.round(avg * 10) / 10 };
  });

  const sleepTrend: TrendPoint[] = keys.map((key) => {
    const value = sleepByDay.get(key);
    return { dayKey: key, value: value ? value.duration : null };
  });

  const activityTrend: TrendPoint[] = keys.map((key) => ({
    dayKey: key,
    value: activityByDay.get(key) ?? 0,
  }));

  const moodScores = [...moodBuckets.values()].flat();
  const averageMood = moodScores.length
    ? Math.round((moodScores.reduce((sum, value) => sum + value, 0) / moodScores.length) * 10) / 10
    : null;

  const nightsLogged = sleepByDay.size;
  const averageSleep = nightsLogged
    ? Math.round(
        [...sleepByDay.values()].reduce((sum, value) => sum + value.duration, 0) / nightsLogged,
      )
    : null;
  const averageQuality = nightsLogged
    ? Math.round(
        ([...sleepByDay.values()].reduce((sum, value) => sum + value.quality, 0) / nightsLogged) * 10,
      ) / 10
    : null;

  const totalActivityMinutes = [...activityByDay.values()].reduce((sum, value) => sum + value, 0);

  const last7 = lastNDays(7);
  const completionsLast7Days = habitCompletions.filter((entry) => entry.dayKey >= last7[0]).length;

  const habitStreaks = new Map<string, number>();
  for (const entry of habitCompletions) {
    habitStreaks.set(String(entry.habitId), (habitStreaks.get(String(entry.habitId)) ?? 0) + 1);
  }
  const bestStreak = habitStreaks.size ? Math.max(...habitStreaks.values()) : 0;

  const level = levelProgress(user.wellness.xp);

  return {
    range: { days, from, to: dayKey() },
    wellness: {
      xp: level.xp,
      level: level.level,
      xpIntoLevel: level.xpIntoLevel,
      xpForNextLevel: level.xpForNextLevel,
      streakDays: user.wellness.streakDays,
      longestStreak: user.wellness.longestStreak,
    },
    totals: {
      assessments: assessmentCount,
      gameSessions: gameSessionCount,
      moodEntries: moodEntries.length,
      journalEntries: journalCount,
      sleepNights: sleepEntries.length,
      activitySessions: activityEntries.length,
      habitCheckIns: totalHabitCheckIns,
    },
    mood: { averageScore: averageMood, entriesLogged: moodEntries.length, trend: moodTrend },
    sleep: {
      averageDurationMinutes: averageSleep,
      averageQuality,
      nightsLogged,
      trend: sleepTrend,
    },
    activity: {
      totalMinutes: totalActivityMinutes,
      sessions: activityEntries.length,
      activeDays: activityByDay.size,
      trend: activityTrend,
    },
    habits: {
      activeHabits: habits.length,
      completionsLast7Days,
      bestStreak,
    },
    latestAssessment: latestAssessment
      ? {
          id: latestAssessment.id,
          code: latestAssessment.assessmentCode,
          summary: latestAssessment.summary,
          priorities: latestAssessment.priorities ?? [],
          indicators: (latestAssessment.indicators as Record<string, number>) ?? {},
          completedAt: latestAssessment.completedAt.toISOString(),
        }
      : null,
  };
}
