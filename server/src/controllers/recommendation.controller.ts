import type { RequestHandler } from 'express';
import { requireUser } from '../middleware/auth.js';
import { ok } from '../utils/http.js';
import { z } from 'zod';
import {
  listRecommendations,
  updateRecommendation,
  type RecommendationDto,
} from '../services/recommendation.service.js';

export const listRecommendationsHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const { status, kind, limit } = z
      .object({
        status: z.enum(['suggested', 'accepted', 'dismissed', 'completed']).optional(),
        kind: z.string().trim().max(30).optional(),
        limit: z.coerce.number().int().min(1).max(50).default(20),
      })
      .parse(req.query);
    const items = await listRecommendations(user, { status, kind, limit });
    ok(res, { recommendations: items });
  } catch (error) {
    next(error);
  }
};

export const updateRecommendationHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const body = req.body as { status?: RecommendationDto['status']; feedbackHelpful?: boolean };
    ok(res, { recommendation: await updateRecommendation(user, String(req.params.id), body) });
  } catch (error) {
    next(error);
  }
};
