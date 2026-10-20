import type { RequestHandler } from 'express';
import { z } from 'zod';
import { MOOD_VALUES } from '../models/index.js';
import { requireUser } from '../middleware/auth.js';
import { ok } from '../utils/http.js';
import { paginate, paginationQuerySchema, skipFor } from '../utils/pagination.js';
import {
  createMoodEntry,
  deleteMoodEntry,
  getMoodTrend,
  getTodayMood,
  listMoodEntries,
  type MoodEntryInput,
} from '../services/mood.service.js';

export const moodBodySchema = z.object({
  mood: z.enum(MOOD_VALUES),
  intensity: z.number().int().min(1).max(5).optional(),
  note: z.string().trim().max(500).optional(),
  activities: z.array(z.string().trim().max(40)).max(20).optional(),
  recordedAt: z.string().datetime().optional(),
});

export const createMoodHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const result = await createMoodEntry(user, req.body as MoodEntryInput);
    ok(res, { entry: result.entry, reward: result.reward }, 201);
  } catch (error) {
    next(error);
  }
};

export const listMoodHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const query = paginationQuerySchema.parse(req.query);
    const range = z
      .object({ from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() })
      .parse(req.query);
    const { items, total } = await listMoodEntries(user, {
      skip: skipFor(query),
      limit: query.limit,
      from: range.from,
      to: range.to,
    });
    ok(res, paginate(items, total, query));
  } catch (error) {
    next(error);
  }
};

export const todayMoodHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    ok(res, { entries: await getTodayMood(user) });
  } catch (error) {
    next(error);
  }
};

export const moodTrendHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const { days } = z.object({ days: z.coerce.number().int().min(2).max(90).default(14) }).parse(req.query);
    ok(res, { days, trend: await getMoodTrend(user, days) });
  } catch (error) {
    next(error);
  }
};

export const deleteMoodHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    await deleteMoodEntry(user, String(req.params.id));
    ok(res, { deleted: true });
  } catch (error) {
    next(error);
  }
};
