import { Habit, HabitEntry, type HabitEntryDoc, type UserDoc } from '../models/index.js';
import type { Types } from 'mongoose';
import { HttpError } from '../middleware/error.js';
import { dayKey } from '../utils/dates.js';
import { touchDailyActivity, type TouchResult } from './wellness.service.js';

export type HabitCategory = 'sleep' | 'movement' | 'mindfulness' | 'social' | 'focus' | 'custom';
export type HabitFrequency = 'daily' | 'weekly' | 'custom';

export interface HabitInput {
  name: string;
  description?: string;
  category?: HabitCategory;
  frequency?: HabitFrequency;
  targetPerPeriod?: number;
  reminderTime?: string;
  emoji?: string;
  startDate?: string;
}

export interface HabitDto {
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
}

export interface HabitWithProgress extends HabitDto {
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
  completionsThisWeek: number;
  weeklyTarget: number;
  recentDays: { dayKey: string; completed: boolean }[];
}

function toDto(doc: {
  _id: unknown;
  name: string;
  description?: string | null;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetPerPeriod: number;
  reminderTime?: string | null;
  emoji: string;
  archived: boolean;
  startDate: string;
  createdAt: Date;
}): HabitDto {
  return {
    id: String(doc._id),
    name: doc.name,
    description: doc.description ?? null,
    category: doc.category,
    frequency: doc.frequency,
    targetPerPeriod: doc.targetPerPeriod,
    reminderTime: doc.reminderTime ?? null,
    emoji: doc.emoji,
    archived: doc.archived,
    startDate: doc.startDate,
    createdAt: doc.createdAt.toISOString(),
  };
}

/** Monday-based ISO week key for grouping weekly habit targets. */
function isoWeekKey(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() - day + 1);
  return dayKey(date);
}

function computeStreak(dayKeys: Set<string>, today: string): { current: number; longest: number } {
  if (dayKeys.size === 0) return { current: 0, longest: 0 };

  let longest = 0;
  let run = 0;
  const sorted = [...dayKeys].sort();
  let previous: string | null = null;
  for (const key of sorted) {
    if (previous && nextDay(previous) === key) run += 1;
    else run = 1;
    longest = Math.max(longest, run);
    previous = key;
  }

  let current = 0;
  let cursor = today;
  const yesterday = prevDay(today);
  if (!dayKeys.has(cursor)) cursor = yesterday;
  while (dayKeys.has(cursor)) {
    current += 1;
    cursor = prevDay(cursor);
  }

  return { current, longest };
}

function nextDay(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + 1);
  return dayKey(date);
}

function prevDay(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() - 1);
  return dayKey(date);
}

export async function listHabits(
  user: UserDoc,
  includeArchived = false,
): Promise<HabitWithProgress[]> {
  const filter: Record<string, unknown> = { userId: user._id, deletedAt: null };
  if (!includeArchived) filter.archived = false;
  const habits = await Habit.find(filter).sort({ createdAt: 1 });

  const today = dayKey();
  const week = isoWeekKey(today);

  // Fetch every habit's completed days in a single query rather than one per
  // habit (avoids an N+1 pattern for users with many habits).
  const habitIds = habits.map((habit) => habit._id);
  const entries = habitIds.length
    ? await HabitEntry.find({ habitId: { $in: habitIds }, completed: true }).select(
        'habitId dayKey',
      )
    : [];

  const daysByHabit = new Map<string, Set<string>>();
  for (const entry of entries) {
    const key = String(entry.habitId);
    let set = daysByHabit.get(key);
    if (!set) {
      set = new Set<string>();
      daysByHabit.set(key, set);
    }
    set.add(entry.dayKey);
  }

  return habits.map((habit) => {
    const days = daysByHabit.get(String(habit._id)) ?? new Set<string>();
    const streak = computeStreak(days, today);
    const completionsThisWeek = [...days].filter((k) => isoWeekKey(k) === week).length;
    const recentDays = lastSevenDays(today).map((key) => ({
      dayKey: key,
      completed: days.has(key),
    }));

    return {
      ...toDto(habit),
      currentStreak: streak.current,
      longestStreak: streak.longest,
      completedToday: days.has(today),
      completionsThisWeek,
      weeklyTarget:
        habit.frequency === 'daily'
          ? 7
          : habit.frequency === 'weekly'
            ? habit.targetPerPeriod
            : habit.targetPerPeriod,
      recentDays,
    };
  });
}

function lastSevenDays(today: string): string[] {
  const keys: string[] = [];
  let cursor = today;
  for (let i = 0; i < 7; i++) {
    keys.unshift(cursor);
    cursor = prevDay(cursor);
  }
  return keys;
}

export async function createHabit(user: UserDoc, input: HabitInput): Promise<HabitDto> {
  const habit = await Habit.create({
    userId: user._id,
    name: input.name,
    description: input.description,
    category: input.category ?? 'custom',
    frequency: input.frequency ?? 'daily',
    targetPerPeriod: input.targetPerPeriod ?? 1,
    reminderTime: input.reminderTime,
    emoji: input.emoji ?? '✅',
    startDate: input.startDate ?? dayKey(),
  });
  return toDto(habit);
}

export async function updateHabit(
  user: UserDoc,
  id: string,
  input: Partial<HabitInput> & { archived?: boolean },
): Promise<HabitDto> {
  const habit = await Habit.findOne({ _id: id, userId: user._id, deletedAt: null });
  if (!habit) throw new HttpError(404, 'Habit not found', 'not_found');
  if (input.name !== undefined) habit.name = input.name;
  if (input.description !== undefined) habit.description = input.description;
  if (input.category !== undefined) habit.category = input.category;
  if (input.frequency !== undefined) habit.frequency = input.frequency;
  if (input.targetPerPeriod !== undefined) habit.targetPerPeriod = input.targetPerPeriod;
  if (input.reminderTime !== undefined) habit.reminderTime = input.reminderTime;
  if (input.emoji !== undefined) habit.emoji = input.emoji;
  if (input.archived !== undefined) habit.archived = input.archived;
  await habit.save();
  return toDto(habit);
}

export async function deleteHabit(user: UserDoc, id: string): Promise<void> {
  const habit = await Habit.findOne({ _id: id, userId: user._id, deletedAt: null });
  if (!habit) throw new HttpError(404, 'Habit not found', 'not_found');
  habit.deletedAt = new Date();
  await habit.save();
}

export interface HabitToggleResult {
  entryId: string | null;
  dayKey: string;
  completed: boolean;
  reward: TouchResult | null;
}

/** Marks a habit complete/incomplete for a day. Only completion grants a reward. */
export async function toggleHabitEntry(
  user: UserDoc,
  habitId: string,
  options: { dayKey?: string; completed: boolean; note?: string },
): Promise<HabitToggleResult> {
  const habit = await Habit.findOne({ _id: habitId, userId: user._id, deletedAt: null });
  if (!habit) throw new HttpError(404, 'Habit not found', 'not_found');

  const day = options.dayKey ?? dayKey();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    throw new HttpError(400, 'Invalid day key', 'invalid_date');
  }

  if (!options.completed) {
    await HabitEntry.deleteOne({ habitId: habit._id, dayKey: day });
    return { entryId: null, dayKey: day, completed: false, reward: null };
  }

  const entry = await upsertHabitEntry(user, habit._id, day, options.note);

  const reward = await touchDailyActivity(user);
  return { entryId: String(entry._id), dayKey: day, completed: true, reward };
}

/**
 * Idempotently records a completion for {habitId, dayKey}. A concurrent
 * double-tap can race the upsert into an E11000 duplicate-key error on the
 * unique index, so we fall back to a plain update when that happens.
 */
async function upsertHabitEntry(
  user: UserDoc,
  habitId: Types.ObjectId,
  day: string,
  note?: string,
): Promise<HabitEntryDoc> {
  try {
    const created = await HabitEntry.findOneAndUpdate(
      { habitId, dayKey: day },
      {
        $set: { userId: user._id, completed: true, note },
        $setOnInsert: { habitId, dayKey: day },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    if (created) return created;
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
  }
  const existing = await HabitEntry.findOneAndUpdate(
    { habitId, dayKey: day },
    { $set: { userId: user._id, completed: true, note } },
    { returnDocument: 'after' },
  );
  if (!existing) throw new HttpError(500, 'Could not record habit entry', 'habit_entry_failed');
  return existing;
}
