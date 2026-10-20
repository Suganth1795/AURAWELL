import type { RequestHandler } from 'express';
import { z } from 'zod';
import { requireUser } from '../middleware/auth.js';
import { ok } from '../utils/http.js';
import { paginate, paginationQuerySchema, skipFor } from '../utils/pagination.js';
import {
  createActivityEntry,
  deleteActivityEntry,
  getActivitySummary,
  listActivityEntries,
  type ActivityEntryInput,
} from '../services/activity.service.js';

export const createActivityHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const result = await createActivityEntry(user, req.body as ActivityEntryInput);
    ok(res, { entry: result.entry, reward: result.reward }, 201);
  } catch (error) {
    next(error);
  }
};

export const listActivityHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const query = paginationQuerySchema.parse(req.query);
    const { items, total } = await listActivityEntries(user, {
      skip: skipFor(query),
      limit: query.limit,
    });
    ok(res, paginate(items, total, query));
  } catch (error) {
    next(error);
  }
};

export const activitySummaryHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const { days } = z.object({ days: z.coerce.number().int().min(2).max(90).default(14) }).parse(req.query);
    ok(res, { summary: await getActivitySummary(user, days) });
  } catch (error) {
    next(error);
  }
};

export const deleteActivityHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    await deleteActivityEntry(user, String(req.params.id));
    ok(res, { deleted: true });
  } catch (error) {
    next(error);
  }
};
