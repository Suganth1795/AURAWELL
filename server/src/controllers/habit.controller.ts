import type { RequestHandler } from 'express';
import { requireUser } from '../middleware/auth.js';
import { ok } from '../utils/http.js';
import { z } from 'zod';
import {
  createHabit,
  deleteHabit,
  listHabits,
  toggleHabitEntry,
  updateHabit,
  type HabitInput,
} from '../services/habit.service.js';

export const listHabitsHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const { includeArchived } = z
      .object({ includeArchived: z.coerce.boolean().default(false) })
      .parse(req.query);
    ok(res, { habits: await listHabits(user, includeArchived) });
  } catch (error) {
    next(error);
  }
};

export const createHabitHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    ok(res, { habit: await createHabit(user, req.body as HabitInput) }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateHabitHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const habit = await updateHabit(user, String(req.params.id), req.body as Partial<HabitInput>);
    ok(res, { habit });
  } catch (error) {
    next(error);
  }
};

export const deleteHabitHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    await deleteHabit(user, String(req.params.id));
    ok(res, { deleted: true });
  } catch (error) {
    next(error);
  }
};

export const toggleHabitHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const { completed, dayKey, note } = req.body as { completed: boolean; dayKey?: string; note?: string };
    const result = await toggleHabitEntry(user, String(req.params.id), { completed, dayKey, note });
    ok(res, result);
  } catch (error) {
    next(error);
  }
};
