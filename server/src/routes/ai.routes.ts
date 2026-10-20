import { Router } from 'express';
import { aiStatusHandler } from '../controllers/counseling.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const aiRouter = Router();

aiRouter.use(requireAuth);

aiRouter.get('/status', aiStatusHandler);
