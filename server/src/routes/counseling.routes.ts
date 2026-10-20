import { Router } from 'express';
import { z } from 'zod';
import {
  closeSessionHandler,
  counselingIntroHandler,
  createSessionHandler,
  deleteSessionHandler,
  getSessionHandler,
  listSessionsHandler,
  sendMessageHandler,
} from '../controllers/counseling.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const counselingRouter = Router();

const idParam = z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id') });

counselingRouter.use(requireAuth);

counselingRouter.get('/intro', counselingIntroHandler);
counselingRouter.get('/sessions', listSessionsHandler);
counselingRouter.post(
  '/sessions',
  validate({ body: z.object({ title: z.string().trim().max(120).optional() }) }),
  createSessionHandler,
);
counselingRouter.get('/sessions/:id', validate({ params: idParam }), getSessionHandler);
counselingRouter.post(
  '/sessions/:id/messages',
  validate({
    params: idParam,
    body: z.object({ content: z.string().trim().min(1).max(2000) }),
  }),
  sendMessageHandler,
);
counselingRouter.post('/sessions/:id/close', validate({ params: idParam }), closeSessionHandler);
counselingRouter.delete('/sessions/:id', validate({ params: idParam }), deleteSessionHandler);
