import { api } from '@/services/api';
import type { Paginated } from '@/types';
import type {
  ActivityEntry,
  ActivitySummary,
  ActivityType,
  Habit,
  HabitCategory,
  HabitFrequency,
  HabitToggleResult,
  JournalEntry,
  JournalPrompt,
  MoodEntry,
  MoodTrendPoint,
  MoodValue,
  RewardSummary,
  SleepEntry,
  SleepSummary,
} from './types';

export interface MoodCreateResponse {
  entry: MoodEntry;
  reward: RewardSummary;
}

export const moodService = {
  async create(input: {
    mood: MoodValue;
    intensity?: number;
    note?: string;
    activities?: string[];
  }): Promise<MoodCreateResponse> {
    return api.post<MoodCreateResponse>('/wellness/mood', input);
  },
  async today(): Promise<MoodEntry[]> {
    const data = await api.get<{ entries: MoodEntry[] }>('/wellness/mood/today');
    return data.entries;
  },
  async trend(days = 14): Promise<MoodTrendPoint[]> {
    const data = await api.get<{ trend: MoodTrendPoint[] }>(`/wellness/mood/trend?days=${days}`);
    return data.trend;
  },
  async history(page = 1, limit = 20): Promise<Paginated<MoodEntry>> {
    return api.get<Paginated<MoodEntry>>(`/wellness/mood?page=${page}&limit=${limit}`);
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/wellness/mood/${id}`);
  },
};

export const journalService = {
  async prompts(): Promise<JournalPrompt[]> {
    const data = await api.get<{ prompts: JournalPrompt[] }>('/wellness/journal/prompts');
    return data.prompts;
  },
  async create(input: {
    title?: string;
    content: string;
    tags?: string[];
    promptId?: string;
  }): Promise<{ entry: JournalEntry; reward: RewardSummary }> {
    return api.post('/wellness/journal', input);
  },
  async list(page = 1, limit = 20): Promise<Paginated<JournalEntry>> {
    return api.get<Paginated<JournalEntry>>(`/wellness/journal?page=${page}&limit=${limit}`);
  },
  async update(
    id: string,
    input: { title?: string; content?: string; tags?: string[] },
  ): Promise<JournalEntry> {
    const data = await api.patch<{ entry: JournalEntry }>(`/wellness/journal/${id}`, input);
    return data.entry;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/wellness/journal/${id}`);
  },
};

export const sleepService = {
  async create(input: {
    startTime: string;
    endTime: string;
    quality: number;
    notes?: string;
  }): Promise<{ entry: SleepEntry; reward: RewardSummary }> {
    return api.post('/wellness/sleep', input);
  },
  async list(page = 1, limit = 20): Promise<Paginated<SleepEntry>> {
    return api.get<Paginated<SleepEntry>>(`/wellness/sleep?page=${page}&limit=${limit}`);
  },
  async summary(days = 14): Promise<SleepSummary> {
    const data = await api.get<{ summary: SleepSummary }>(`/wellness/sleep/summary?days=${days}`);
    return data.summary;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/wellness/sleep/${id}`);
  },
};

export const activityService = {
  async create(input: {
    type: ActivityType;
    durationMinutes: number;
    steps?: number;
    notes?: string;
  }): Promise<{ entry: ActivityEntry; reward: RewardSummary }> {
    return api.post('/wellness/activity', input);
  },
  async list(page = 1, limit = 20): Promise<Paginated<ActivityEntry>> {
    return api.get<Paginated<ActivityEntry>>(`/wellness/activity?page=${page}&limit=${limit}`);
  },
  async summary(days = 14): Promise<ActivitySummary> {
    const data = await api.get<{ summary: ActivitySummary }>(`/wellness/activity/summary?days=${days}`);
    return data.summary;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/wellness/activity/${id}`);
  },
};

export interface HabitInput {
  name: string;
  description?: string;
  category?: HabitCategory;
  frequency?: HabitFrequency;
  targetPerPeriod?: number;
  reminderTime?: string;
  emoji?: string;
}

export const habitService = {
  async list(includeArchived = false): Promise<Habit[]> {
    const data = await api.get<{ habits: Habit[] }>(
      `/wellness/habits?includeArchived=${includeArchived}`,
    );
    return data.habits;
  },
  async create(input: HabitInput): Promise<Habit> {
    const data = await api.post<{ habit: Habit }>('/wellness/habits', input);
    return data.habit;
  },
  async update(id: string, input: Partial<HabitInput> & { archived?: boolean }): Promise<Habit> {
    const data = await api.patch<{ habit: Habit }>(`/wellness/habits/${id}`, input);
    return data.habit;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/wellness/habits/${id}`);
  },
  async toggle(id: string, completed: boolean, dayKey?: string): Promise<HabitToggleResult> {
    return api.post<HabitToggleResult>(`/wellness/habits/${id}/entries`, { completed, dayKey });
  },
};
