import { Router } from 'express';
import { z } from 'zod';
import {
  listRecommendationsHandler,
  updateRecommendationHandler,
} from '../controllers/recommendation.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const recommendationsRouter = Router();

recommendationsRouter.use(requireAuth);

recommendationsRouter.get('/', listRecommendationsHandler);
recommendationsRouter.patch(
  '/:id',
  validate({
    params: z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id') }),
    body: z.object({
      status: z.enum(['suggested', 'accepted', 'dismissed', 'completed']).optional(),
      feedbackHelpful: z.boolean().optional(),
    }),
  }),
  updateRecommendationHandler,
);
