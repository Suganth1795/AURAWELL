import { Router } from 'express';
import { analyticsOverviewHandler } from '../controllers/analytics.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth);
analyticsRouter.get('/overview', analyticsOverviewHandler);
