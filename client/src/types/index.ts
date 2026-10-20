export type AgeGroup = 'child' | 'teen' | 'adult' | 'older_adult';

export interface UserPreferences {
  theme: 'system' | 'light' | 'dark';
  contrast: 'default' | 'high' | 'dark';
  fontScale: number;
  reduceMotion: boolean;
  audioInstructions: boolean;
  notifications: {
    dailyCheckIn: boolean;
    weeklySummary: boolean;
    habitReminders: boolean;
  };
  aiWellnessDataConsent: boolean;
  journalAiConsent: boolean;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  ageGroup: AgeGroup;
  birthYear: number | null;
  role: 'user' | 'admin';
  timezone: string;
  onboardingCompleted: boolean;
  wellness: {
    xp: number;
    level: number;
    streakDays: number;
    longestStreak: number;
    avatar: { emoji: string; color: string };
  };
  preferences: UserPreferences;
  createdAt: string;
}

export interface ApiErrorBody {
  error: { message: string; code: string; details?: unknown };
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
