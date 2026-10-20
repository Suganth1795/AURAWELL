import { ActivityEntry, ACTIVITY_TYPES, type ActivityType, type UserDoc } from '../models/index.js';
import { HttpError } from '../middleware/error.js';
import { dayKey, lastNDays } from '../utils/dates.js';
import { touchDailyActivity, type TouchResult } from './wellness.service.js';

export interface ActivityEntryInput {
  type: ActivityType;
  durationMinutes: number;
  steps?: number;
  notes?: string;
  occurredAt?: string;
}

export interface ActivityEntryDto {
  id: string;
  dayKey: string;
  type: ActivityType;
  durationMinutes: number;
  steps: number | null;
  notes: string | null;
  occurredAt: string;
  source: 'manual' | 'device';
}

function toDto(doc: {
  _id: unknown;
  dayKey: string;
  type: ActivityType;
  durationMinutes: number;
  steps?: number | null;
  notes?: string | null;
  occurredAt: Date;
  source: 'manual' | 'device';
}): ActivityEntryDto {
  return {
    id: String(doc._id),
    dayKey: doc.dayKey,
    type: doc.type,
    durationMinutes: doc.durationMinutes,
    steps: doc.steps ?? null,
    notes: doc.notes ?? null,
    occurredAt: doc.occurredAt.toISOString(),
    source: doc.source,
  };
}

export async function createActivityEntry(
  user: UserDoc,
  input: ActivityEntryInput,
): Promise<{ entry: ActivityEntryDto; reward: TouchResult }> {
  if (!ACTIVITY_TYPES.includes(input.type)) {
    throw new HttpError(400, 'Unknown activity type', 'unknown_activity_type');
  }
  const occurredAt = input.occurredAt ? new Date(input.occurredAt) : new Date();
  if (Number.isNaN(occurredAt.getTime())) {
    throw new HttpError(400, 'Invalid occurredAt value', 'invalid_date');
  }

  const entry = await ActivityEntry.create({
    userId: user._id,
    dayKey: dayKey(occurredAt),
    type: input.type,
    durationMinutes: input.durationMinutes,
    steps: input.steps,
    notes: input.notes,
    occurredAt,
  });

  const reward = await touchDailyActivity(user);
  return { entry: toDto(entry), reward };
}

export async function listActivityEntries(
  user: UserDoc,
  options: { skip: number; limit: number },
): Promise<{ items: ActivityEntryDto[]; total: number }> {
  const filter = { userId: user._id };
  const [docs, total] = await Promise.all([
    ActivityEntry.find(filter).sort({ occurredAt: -1 }).skip(options.skip).limit(options.limit),
    ActivityEntry.countDocuments(filter),
  ]);
  return { items: docs.map(toDto), total };
}

export async function deleteActivityEntry(user: UserDoc, id: string): Promise<void> {
  const result = await ActivityEntry.deleteOne({ _id: id, userId: user._id });
  if (result.deletedCount === 0) throw new HttpError(404, 'Activity entry not found', 'not_found');
}

export interface ActivitySummary {
  days: number;
  totalMinutes: number;
  totalSessions: number;
  activeDays: number;
  averageMinutesPerActiveDay: number | null;
  series: { dayKey: string; durationMinutes: number; sessions: number }[];
}

/** Aggregate activity over recent days without any calorie/weight framing. */
export async function getActivitySummary(user: UserDoc, days = 14): Promise<ActivitySummary> {
  const keys = lastNDays(days);
  const docs = await ActivityEntry.find({ userId: user._id, dayKey: { $gte: keys[0] } }).sort({
    dayKey: 1,
  });

  const byDay = new Map<string, { duration: number; sessions: number }>();
  for (const doc of docs) {
    const existing = byDay.get(doc.dayKey) ?? { duration: 0, sessions: 0 };
    existing.duration += doc.durationMinutes;
    existing.sessions += 1;
    byDay.set(doc.dayKey, existing);
  }

  let totalMinutes = 0;
  const series = keys.map((key) => {
    const value = byDay.get(key) ?? { duration: 0, sessions: 0 };
    totalMinutes += value.duration;
    return { dayKey: key, durationMinutes: value.duration, sessions: value.sessions };
  });

  return {
    days,
    totalMinutes,
    totalSessions: docs.length,
    activeDays: byDay.size,
    averageMinutesPerActiveDay: byDay.size ? Math.round(totalMinutes / byDay.size) : null,
    series,
  };
}
