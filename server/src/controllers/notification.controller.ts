import type { RequestHandler } from 'express';
import { z } from 'zod';
import { requireUser } from '../middleware/auth.js';
import { ok } from '../utils/http.js';
import { booleanQuery } from '../utils/zod.js';
import {
  deleteNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notification.service.js';

export const listNotificationsHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const { limit, unreadOnly } = z
      .object({
        limit: z.coerce.number().int().min(1).max(50).default(20),
        unreadOnly: booleanQuery.optional(),
      })
      .parse(req.query);
    ok(res, await listNotifications(user, { limit, unreadOnly }));
  } catch (error) {
    next(error);
  }
};

export const markNotificationReadHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    ok(res, { notification: await markNotificationRead(user, String(req.params.id)) });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsReadHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    ok(res, await markAllNotificationsRead(user));
  } catch (error) {
    next(error);
  }
};

export const deleteNotificationHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    await deleteNotification(user, String(req.params.id));
    ok(res, { deleted: true });
  } catch (error) {
    next(error);
  }
};
