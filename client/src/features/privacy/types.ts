export interface ConsentHistoryItem {
  type: string;
  granted: boolean;
  latestAt: string;
  version: string;
  source: string;
}

export interface PrivacyOverview {
  consents: {
    current: { aiWellnessDataConsent: boolean; journalAiConsent: boolean };
    history: ConsentHistoryItem[];
  };
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

export type DataExportBundle = Record<string, unknown> & {
  exportedAt: string;
  formatVersion: string;
};
