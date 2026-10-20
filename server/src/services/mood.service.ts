import { MoodEntry, MOOD_SCORE, type MoodValue, type UserDoc } from '../models/index.js';
import { HttpError } from '../middleware/error.js';
import { dayKey, lastNDays } from '../utils/dates.js';
import { touchDailyActivity, type TouchResult } from './wellness.service.js';

export interface MoodEntryInput {
  mood: MoodValue;
  intensity?: number;
  note?: string;
  activities?: string[];
  recordedAt?: string;
}

export interface MoodEntryDto {
  id: string;
  mood: MoodValue;
  score: number;
  intensity: number | null;
  note: string | null;
  activities: string[];
  recordedAt: string;
  dayKey: string;
}

function toDto(doc: {
  _id: unknown;
  mood: MoodValue;
  intensity?: number | null;
  note?: string | null;
  activities?: string[];
  recordedAt: Date;
  dayKey: string;
}): MoodEntryDto {
  return {
    id: String(doc._id),
    mood: doc.mood,
    score: MOOD_SCORE[doc.mood],
    intensity: doc.intensity ?? null,
    note: doc.note ?? null,
    activities: doc.activities ?? [],
    recordedAt: doc.recordedAt.toISOString(),
    dayKey: doc.dayKey,
  };
}

export interface MoodCreateResult {
  entry: MoodEntryDto;
  reward: TouchResult;
}

export async function createMoodEntry(user: UserDoc, input: MoodEntryInput): Promise<MoodCreateResult> {
  const recordedAt = input.recordedAt ? new Date(input.recordedAt) : new Date();
  if (Number.isNaN(recordedAt.getTime())) {
    throw new HttpError(400, 'Invalid recordedAt value', 'invalid_date');
  }

  const entry = await MoodEntry.create({
    userId: user._id,
    mood: input.mood,
    intensity: input.intensity,
    note: input.note,
    activities: input.activities ?? [],
    recordedAt,
    dayKey: dayKey(recordedAt),
  });

  const reward = await touchDailyActivity(user);
  return { entry: toDto(entry), reward };
}

export async function listMoodEntries(
  user: UserDoc,
  options: { skip: number; limit: number; from?: string; to?: string },
): Promise<{ items: MoodEntryDto[]; total: number }> {
  const filter: Record<string, unknown> = { userId: user._id };
  if (options.from || options.to) {
    filter.dayKey = {
      ...(options.from ? { $gte: options.from } : {}),
      ...(options.to ? { $lte: options.to } : {}),
    };
  }

  const [docs, total] = await Promise.all([
    MoodEntry.find(filter).sort({ recordedAt: -1 }).skip(options.skip).limit(options.limit),
    MoodEntry.countDocuments(filter),
  ]);

  return { items: docs.map(toDto), total };
}

export async function getTodayMood(user: UserDoc): Promise<MoodEntryDto[]> {
  const docs = await MoodEntry.find({ userId: user._id, dayKey: dayKey() }).sort({ recordedAt: -1 });
  return docs.map(toDto);
}

export interface MoodTrendPoint {
  dayKey: string;
  average: number | null;
  entryCount: number;
}

/**
 * Daily average mood score over the last `days` days (UTC). Days with no entry
 * report `average: null` so the client can render gaps honestly.
 */
export async function getMoodTrend(user: UserDoc, days = 14): Promise<MoodTrendPoint[]> {
  const keys = lastNDays(days);
  const docs = await MoodEntry.find({ userId: user._id, dayKey: { $gte: keys[0] } }).select(
    'dayKey mood',
  );

  const buckets = new Map<string, number[]>();
  for (const doc of docs) {
    const list = buckets.get(doc.dayKey) ?? [];
    list.push(MOOD_SCORE[doc.mood as MoodValue]);
    buckets.set(doc.dayKey, list);
  }

  return keys.map((key) => {
    const scores = buckets.get(key);
    if (!scores || scores.length === 0) return { dayKey: key, average: null, entryCount: 0 };
    const average = scores.reduce((sum, value) => sum + value, 0) / scores.length;
    return {
      dayKey: key,
      average: Math.round(average * 10) / 10,
      entryCount: scores.length,
    };
  });
}

export async function deleteMoodEntry(user: UserDoc, id: string): Promise<void> {
  const result = await MoodEntry.deleteOne({ _id: id, userId: user._id });
  if (result.deletedCount === 0) {
    throw new HttpError(404, 'Mood entry not found', 'not_found');
  }
}
