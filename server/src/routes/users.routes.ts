import { Router } from 'express';
import { z } from 'zod';
import {
  completeOnboardingHandler,
  createGoalHandler,
  deleteAccountHandler,
  getGoalsHandler,
  getProfileHandler,
  listConsentHandler,
  recordConsentHandler,
  updateAccountHandler,
  updateGoalHandler,
  updatePreferencesHandler,
} from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  consentSchema,
  onboardingSchema,
  preferencesSchema,
} from '../validators/auth.validators.js';

export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get('/profile', getProfileHandler);
usersRouter.patch(
  '/profile',
  validate({
    body: z.object({
      displayName: z.string().trim().min(2).max(60).optional(),
      birthYear: z.number().int().optional(),
    }),
  }),
  updateAccountHandler,
);
usersRouter.put('/preferences', validate({ body: preferencesSchema }), updatePreferencesHandler);
usersRouter.put('/onboarding', validate({ body: onboardingSchema }), completeOnboardingHandler);
usersRouter.get('/consent', listConsentHandler);
usersRouter.post('/consent', validate({ body: consentSchema }), recordConsentHandler);
usersRouter.get('/goals', getGoalsHandler);
usersRouter.post(
  '/goals',
  validate({
    body: z.object({
      title: z.string().trim().min(3).max(100),
      description: z.string().max(400).optional(),
      category: z.string().max(30).optional(),
      targetDate: z.string().max(20).optional(),
    }),
  }),
  createGoalHandler,
);
usersRouter.patch(
  '/goals/:id',
  validate({
    params: z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id') }),
    body: z.object({
      status: z.enum(['active', 'completed', 'archived']).optional(),
      progress: z.number().min(0).max(100).optional(),
      title: z.string().trim().min(3).max(100).optional(),
    }),
  }),
  updateGoalHandler,
);
usersRouter.post(
  '/account/delete',
  validate({ body: z.object({ password: z.string().min(1) }) }),
  deleteAccountHandler,
);
