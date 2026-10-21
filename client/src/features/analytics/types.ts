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
  mood: { averageScore: number | null; entriesLogged: number; trend: TrendPoint[] };
  sleep: {
    averageDurationMinutes: number | null;
    averageQuality: number | null;
    nightsLogged: number;
    trend: TrendPoint[];
  };
  activity: { totalMinutes: number; sessions: number; activeDays: number; trend: TrendPoint[] };
  habits: { activeHabits: number; completionsLast7Days: number; bestStreak: number };
  latestAssessment: {
    id: string;
    code: string;
    summary: string;
    priorities: string[];
    completedAt: string;
  } | null;
}
