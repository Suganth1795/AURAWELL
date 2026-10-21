import {
  ActivityEntry,
  AssessmentResponse,
  ChatMessage,
  ChatSession,
  ConsentRecord,
  GameSession,
  Goal,
  Habit,
  HabitEntry,
  JournalEntry,
  MoodEntry,
  Notification,
  Recommendation,
  SleepEntry,
  toUserPublicDto,
  type UserDoc,
} from '../models/index.js';

export interface ConsentSummaryItem {
  type: string;
  granted: boolean;
  latestAt: string;
  version: string;
  source: string;
}

export interface PrivacyConsentSummary {
  current: {
    aiWellnessDataConsent: boolean;
    journalAiConsent: boolean;
  };
  history: ConsentSummaryItem[];
}

/** Summarises the user's current consent switches plus their recorded history. */
export async function getConsentSummary(user: UserDoc): Promise<PrivacyConsentSummary> {
  const records = await ConsentRecord.find({ userId: user._id }).sort({ createdAt: -1 });

  const latestByType = new Map<string, ConsentSummaryItem>();
  for (const record of records) {
    if (latestByType.has(record.type)) continue;
    latestByType.set(record.type, {
      type: record.type,
      granted: record.granted,
      latestAt: record.createdAt.toISOString(),
      version: record.version,
      source: record.source,
    });
  }

  return {
    current: {
      aiWellnessDataConsent: user.preferences.aiWellnessDataConsent,
      journalAiConsent: user.preferences.journalAiConsent,
    },
    history: [...latestByType.values()],
  };
}

export interface DataExportBundle {
  exportedAt: string;
  formatVersion: string;
  profile: ReturnType<typeof toUserPublicDto>;
  consents: PrivacyConsentSummary;
  goals: unknown[];
  assessments: unknown[];
  recommendations: unknown[];
  games: unknown[];
  mood: unknown[];
  journal: unknown[];
  sleep: unknown[];
  activity: unknown[];
  habits: unknown[];
  habitEntries: unknown[];
  counseling: { sessions: unknown[]; messages: unknown[] };
  notifications: unknown[];
}

function iso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

/**
 * Builds a complete, self-contained export of everything AuraWell stores about
 * the user. Chat/journal content is included because it belongs to the user;
 * password and reset secrets are never part of the export.
 */
export async function buildDataExport(user: UserDoc): Promise<DataExportBundle> {
  const userId = user._id;

  const [
    consents,
    goals,
    assessments,
    recommendations,
    games,
    mood,
    journal,
    sleep,
    activity,
    habits,
    habitEntries,
    chatSessions,
    chatMessages,
    notifications,
  ] = await Promise.all([
    getConsentSummary(user),
    Goal.find({ userId }).lean(),
    AssessmentResponse.find({ userId }).lean(),
    Recommendation.find({ userId }).lean(),
    GameSession.find({ userId }).lean(),
    MoodEntry.find({ userId }).lean(),
    JournalEntry.find({ userId }).lean(),
    SleepEntry.find({ userId }).lean(),
    ActivityEntry.find({ userId }).lean(),
    Habit.find({ userId }).lean(),
    HabitEntry.find({ userId }).lean(),
    ChatSession.find({ userId }).lean(),
    ChatMessage.find({ userId }).lean(),
    Notification.find({ userId }).lean(),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    formatVersion: '1.0',
    profile: toUserPublicDto(user),
    consents,
    goals,
    assessments,
    recommendations,
    games,
    mood,
    journal,
    sleep,
    activity,
    habits,
    habitEntries,
    counseling: { sessions: chatSessions, messages: chatMessages },
    notifications,
  };
}

export interface PrivacyOverview {
  consents: PrivacyConsentSummary;
  counts: {
    goals: number;
    assessments: number;
    recommendations: number;
    games: number;
    mood: number;
    journal: number;
    sleep: number;
    activity: number;
    habits: number;
    counselingSessions: number;
    counselingMessages: number;
    notifications: number;
  };
  export: { formatVersion: string; available: boolean };
  account: { status: string; deletedAt: string | null };
}

/** Lightweight privacy dashboard payload: consent state, data counts, account status. */
export async function getPrivacyOverview(user: UserDoc): Promise<PrivacyOverview> {
  const userId = user._id;
  const [
    consents,
    goals,
    assessments,
    recommendations,
    games,
    mood,
    journal,
    sleep,
    activity,
    habits,
    counselingSessions,
    counselingMessages,
    notifications,
  ] = await Promise.all([
    getConsentSummary(user),
    Goal.countDocuments({ userId }),
    AssessmentResponse.countDocuments({ userId }),
    Recommendation.countDocuments({ userId }),
    GameSession.countDocuments({ userId }),
    MoodEntry.countDocuments({ userId }),
    JournalEntry.countDocuments({ userId, deletedAt: null }),
    SleepEntry.countDocuments({ userId }),
    ActivityEntry.countDocuments({ userId }),
    Habit.countDocuments({ userId, deletedAt: null }),
    ChatSession.countDocuments({ userId }),
    ChatMessage.countDocuments({ userId }),
    Notification.countDocuments({ userId }),
  ]);

  return {
    consents,
    counts: {
      goals,
      assessments,
      recommendations,
      games,
      mood,
      journal,
      sleep,
      activity,
      habits,
      counselingSessions,
      counselingMessages,
      notifications,
    },
    export: { formatVersion: '1.0', available: true },
    account: {
      status: user.status,
      deletedAt: iso(user.deletedAt ?? null),
    },
  };
}
