import type { Paginated } from '@/types';

export type MoodValue = 'great' | 'good' | 'okay' | 'low' | 'struggling';

export interface RewardSummary {
  xpAwarded: number;
  xp: number;
  level: number;
  leveledUp: boolean;
  streakDays: number;
  longestStreak: number;
  streakExtended: boolean;
}

export interface MoodEntry {
  id: string;
  mood: MoodValue;
  score: number;
  intensity: number | null;
  note: string | null;
  activities: string[];
  recordedAt: string;
  dayKey: string;
}

export interface MoodTrendPoint {
  dayKey: string;
  average: number | null;
  entryCount: number;
}

export interface JournalPrompt {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  tags: string[];
}

export interface JournalEntry {
  id: string;
  title: string | null;
  content: string;
  tags: string[];
  promptId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SleepEntry {
  id: string;
  dayKey: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  quality: number;
  notes: string | null;
  source: 'manual' | 'device';
}

export interface SleepSummary {
  days: number;
  averageDurationMinutes: number | null;
  averageQuality: number | null;
  nightsLogged: number;
  lastNight: SleepEntry | null;
  series: { dayKey: string; durationMinutes: number | null; quality: number | null }[];
}

export const ACTIVITY_TYPES = [
  'walk',
  'run',
  'cycle',
  'yoga',
  'strength',
  'sport',
  'stretch',
  'dance',
  'other',
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export interface ActivityEntry {
  id: string;
  dayKey: string;
  type: ActivityType;
  durationMinutes: number;
  steps: number | null;
  notes: string | null;
  occurredAt: string;
  source: 'manual' | 'device';
}

export interface ActivitySummary {
  days: number;
  totalMinutes: number;
  totalSessions: number;
  activeDays: number;
  averageMinutesPerActiveDay: number | null;
  series: { dayKey: string; durationMinutes: number; sessions: number }[];
}

export type HabitCategory = 'sleep' | 'movement' | 'mindfulness' | 'social' | 'focus' | 'custom';
export type HabitFrequency = 'daily' | 'weekly' | 'custom';

export interface Habit {
  id: string;
  name: string;
  description: string | null;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetPerPeriod: number;
  reminderTime: string | null;
  emoji: string;
  archived: boolean;
  startDate: string;
  createdAt: string;
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
  completionsThisWeek: number;
  weeklyTarget: number;
  recentDays: { dayKey: string; completed: boolean }[];
}

export interface HabitToggleResult {
  entryId: string | null;
  dayKey: string;
  completed: boolean;
  reward: RewardSummary | null;
}

export type PaginatedMood = Paginated<MoodEntry>;
export type PaginatedJournal = Paginated<JournalEntry>;
export type PaginatedSleep = Paginated<SleepEntry>;
export type PaginatedActivity = Paginated<ActivityEntry>;
