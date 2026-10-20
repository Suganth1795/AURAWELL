import type { RequestHandler } from 'express';
import { z } from 'zod';
import { requireUser } from '../middleware/auth.js';
import { ok } from '../utils/http.js';
import { paginate, paginationQuerySchema, skipFor } from '../utils/pagination.js';
import {
  createSleepEntry,
  deleteSleepEntry,
  getSleepSummary,
  listSleepEntries,
  type SleepEntryInput,
} from '../services/sleep.service.js';

export const createSleepHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const result = await createSleepEntry(user, req.body as SleepEntryInput);
    ok(res, { entry: result.entry, reward: result.reward }, 201);
  } catch (error) {
    next(error);
  }
};

export const listSleepHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const query = paginationQuerySchema.parse(req.query);
    const { items, total } = await listSleepEntries(user, {
      skip: skipFor(query),
      limit: query.limit,
    });
    ok(res, paginate(items, total, query));
  } catch (error) {
    next(error);
  }
};

export const sleepSummaryHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const { days } = z.object({ days: z.coerce.number().int().min(2).max(90).default(14) }).parse(req.query);
    ok(res, { summary: await getSleepSummary(user, days) });
  } catch (error) {
    next(error);
  }
};

export const deleteSleepHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    await deleteSleepEntry(user, String(req.params.id));
    ok(res, { deleted: true });
  } catch (error) {
    next(error);
  }
};
