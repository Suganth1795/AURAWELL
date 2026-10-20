import type { RequestHandler } from 'express';
import { requireUser } from '../middleware/auth.js';
import { ok } from '../utils/http.js';
import { getChatProvider } from '../ai/index.js';
import { CRISIS_RESOURCES } from '../services/safety.service.js';
import {
  closeSession,
  counselingIntro,
  createSession,
  deleteSession,
  getSessionWithMessages,
  listSessions,
  sendMessage,
} from '../services/counseling.service.js';

export const counselingIntroHandler: RequestHandler = (req, res, next) => {
  try {
    const user = requireUser(req);
    ok(res, counselingIntro(user, CRISIS_RESOURCES));
  } catch (error) {
    next(error);
  }
};

export const listSessionsHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    ok(res, { sessions: await listSessions(user) });
  } catch (error) {
    next(error);
  }
};

export const createSessionHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const { title } = req.body as { title?: string };
    ok(res, { session: await createSession(user, title) }, 201);
  } catch (error) {
    next(error);
  }
};

export const getSessionHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    ok(res, await getSessionWithMessages(user, String(req.params.id)));
  } catch (error) {
    next(error);
  }
};

export const sendMessageHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const { content } = req.body as { content: string };
    const result = await sendMessage(user, String(req.params.id), content);
    ok(res, result, 201);
  } catch (error) {
    next(error);
  }
};

export const closeSessionHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    ok(res, { session: await closeSession(user, String(req.params.id)) });
  } catch (error) {
    next(error);
  }
};

export const deleteSessionHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    await deleteSession(user, String(req.params.id));
    ok(res, { deleted: true });
  } catch (error) {
    next(error);
  }
};

export const aiStatusHandler: RequestHandler = (_req, res) => {
  const provider = getChatProvider();
  res.json({
    data: {
      provider: provider.name,
      configured: provider.isConfigured(),
    },
  });
};
