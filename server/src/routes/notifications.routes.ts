import { Router } from 'express';
import { z } from 'zod';
import {
  deleteNotificationHandler,
  listNotificationsHandler,
  markAllNotificationsReadHandler,
  markNotificationReadHandler,
} from '../controllers/notification.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get('/', listNotificationsHandler);
notificationsRouter.post('/read-all', markAllNotificationsReadHandler);
notificationsRouter.post(
  '/:id/read',
  validate({ params: z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id') }) }),
  markNotificationReadHandler,
);
notificationsRouter.delete(
  '/:id',
  validate({ params: z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id') }) }),
  deleteNotificationHandler,
);
