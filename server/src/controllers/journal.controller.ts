import type { RequestHandler } from 'express';
import { requireUser } from '../middleware/auth.js';
import { ok } from '../utils/http.js';
import { paginate, paginationQuerySchema, skipFor } from '../utils/pagination.js';
import {
  createJournalEntry,
  deleteJournalEntry,
  getJournalEntry,
  journalPromptsFor,
  listJournalEntries,
  updateJournalEntry,
  type JournalEntryInput,
} from '../services/journal.service.js';

export const listJournalPromptsHandler: RequestHandler = (req, res, next) => {
  try {
    const user = requireUser(req);
    ok(res, { prompts: journalPromptsFor(user) });
  } catch (error) {
    next(error);
  }
};

export const createJournalHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const result = await createJournalEntry(user, req.body as JournalEntryInput);
    ok(res, { entry: result.entry, reward: result.reward }, 201);
  } catch (error) {
    next(error);
  }
};

export const listJournalHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const query = paginationQuerySchema.parse(req.query);
    const { tag, search } = req.query as { tag?: string; search?: string };
    const { items, total } = await listJournalEntries(user, {
      skip: skipFor(query),
      limit: query.limit,
      tag,
      search,
    });
    ok(res, paginate(items, total, query));
  } catch (error) {
    next(error);
  }
};

export const getJournalHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    ok(res, { entry: await getJournalEntry(user, String(req.params.id)) });
  } catch (error) {
    next(error);
  }
};

export const updateJournalHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const entry = await updateJournalEntry(user, String(req.params.id), req.body as Partial<JournalEntryInput>);
    ok(res, { entry });
  } catch (error) {
    next(error);
  }
};

export const deleteJournalHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    await deleteJournalEntry(user, String(req.params.id));
    ok(res, { deleted: true });
  } catch (error) {
    next(error);
  }
};
