import { SleepEntry, type UserDoc } from '../models/index.js';
import { HttpError } from '../middleware/error.js';
import { dayKey, lastNDays, sleepDurationMinutes } from '../utils/dates.js';
import { touchDailyActivity, type TouchResult } from './wellness.service.js';

export interface SleepEntryInput {
  dayKey?: string;
  startTime: string;
  endTime: string;
  quality: number;
  notes?: string;
}

const HOURS_PER_NIGHT_MIN = 240;
const HOURS_PER_NIGHT_MAX = 840;

export interface SleepEntryDto {
  id: string;
  dayKey: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  quality: number;
  notes: string | null;
  source: 'manual' | 'device';
}

function toDto(doc: {
  _id: unknown;
  dayKey: string;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  quality: number;
  notes?: string | null;
  source: 'manual' | 'device';
}): SleepEntryDto {
  return {
    id: String(doc._id),
    dayKey: doc.dayKey,
    startTime: doc.startTime.toISOString(),
    endTime: doc.endTime.toISOString(),
    durationMinutes: doc.durationMinutes,
    quality: doc.quality,
    notes: doc.notes ?? null,
    source: doc.source,
  };
}

export async function createSleepEntry(
  user: UserDoc,
  input: SleepEntryInput,
): Promise<{ entry: SleepEntryDto; reward: TouchResult }> {
  const start = new Date(input.startTime);
  const end = new Date(input.endTime);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new HttpError(400, 'Invalid start or end time', 'invalid_date');
  }
  const duration = sleepDurationMinutes(start, end);
  if (duration === null) {
    throw new HttpError(400, 'End time must be after start time and within 24 hours', 'invalid_range');
  }
  if (duration < HOURS_PER_NIGHT_MIN || duration > HOURS_PER_NIGHT_MAX) {
    throw new HttpError(
      400,
      'Sleep duration looks implausible; please double-check the times',
      'implausible_duration',
    );
  }

  const entry = await SleepEntry.create({
    userId: user._id,
    dayKey: input.dayKey ?? dayKey(end),
    startTime: start,
    endTime: end,
    durationMinutes: duration,
    quality: input.quality,
    notes: input.notes,
  });

  const reward = await touchDailyActivity(user);
  return { entry: toDto(entry), reward };
}

export async function listSleepEntries(
  user: UserDoc,
  options: { skip: number; limit: number },
): Promise<{ items: SleepEntryDto[]; total: number }> {
  const filter = { userId: user._id };
  const [docs, total] = await Promise.all([
    SleepEntry.find(filter).sort({ dayKey: -1 }).skip(options.skip).limit(options.limit),
    SleepEntry.countDocuments(filter),
  ]);
  return { items: docs.map(toDto), total };
}

export async function deleteSleepEntry(user: UserDoc, id: string): Promise<void> {
  const result = await SleepEntry.deleteOne({ _id: id, userId: user._id });
  if (result.deletedCount === 0) throw new HttpError(404, 'Sleep entry not found', 'not_found');
}

export interface SleepSummary {
  days: number;
  averageDurationMinutes: number | null;
  averageQuality: number | null;
  nightsLogged: number;
  lastNight: SleepEntryDto | null;
  series: { dayKey: string; durationMinutes: number | null; quality: number | null }[];
}

export async function getSleepSummary(user: UserDoc, days = 14): Promise<SleepSummary> {
  const keys = lastNDays(days);
  const docs = await SleepEntry.find({ userId: user._id, dayKey: { $gte: keys[0] } }).sort({
    dayKey: 1,
  });

  const byDay = new Map<string, { duration: number; quality: number }>();
  for (const doc of docs) {
    const existing = byDay.get(doc.dayKey);
    if (existing) {
      existing.duration += doc.durationMinutes;
      existing.quality = Math.max(existing.quality, doc.quality);
    } else {
      byDay.set(doc.dayKey, { duration: doc.durationMinutes, quality: doc.quality });
    }
  }

  let durationTotal = 0;
  let qualityTotal = 0;
  const series = keys.map((key) => {
    const value = byDay.get(key);
    if (!value) return { dayKey: key, durationMinutes: null, quality: null };
    durationTotal += value.duration;
    qualityTotal += value.quality;
    return { dayKey: key, durationMinutes: value.duration, quality: value.quality };
  });

  const nightsLogged = byDay.size;
  const lastNightDoc = await SleepEntry.findOne({ userId: user._id }).sort({ dayKey: -1 });

  return {
    days,
    averageDurationMinutes: nightsLogged ? Math.round(durationTotal / nightsLogged) : null,
    averageQuality: nightsLogged ? Math.round((qualityTotal / nightsLogged) * 10) / 10 : null,
    nightsLogged,
    lastNight: lastNightDoc ? toDto(lastNightDoc) : null,
    series,
  };
}
