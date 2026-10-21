import type { RequestHandler } from 'express';
import { z } from 'zod';
import { requireUser } from '../middleware/auth.js';
import { ok } from '../utils/http.js';
import { getAnalyticsOverview } from '../services/analytics.service.js';

export const analyticsOverviewHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const { days } = z
      .object({ days: z.coerce.number().int().min(7).max(90).default(14) })
      .parse(req.query);
    ok(res, await getAnalyticsOverview(user, days));
  } catch (error) {
    next(error);
  }
};
