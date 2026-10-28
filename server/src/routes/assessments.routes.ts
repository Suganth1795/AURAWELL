import { Router } from 'express';
import { z } from 'zod';
import {
  getAssessmentHandler,
  getAssessmentStatsSummaryHandler,
  getResponseHandler,
  listAssessmentsHandler,
  listResponsesHandler,
  submitAssessmentHandler,
} from '../controllers/assessment.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const assessmentsRouter = Router();

const codeParam = z.object({ code: z.string().trim().min(2).max(40) });
const idParam = z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id') });
const modeSchema = z.enum(['quick', 'standard', 'detailed', 'daily', 'weekly']).optional();

const answerSchema = z.object({
  questionId: z.string().min(1).max(60),
  optionIds: z.array(z.string().min(1).max(60)).max(20).optional(),
  value: z.number().optional(),
  text: z.string().max(500).optional(),
});

assessmentsRouter.use(requireAuth);

assessmentsRouter.get('/stats/summary', getAssessmentStatsSummaryHandler);
assessmentsRouter.get('/', listAssessmentsHandler);
assessmentsRouter.get('/responses', listResponsesHandler);
assessmentsRouter.get('/responses/:id', validate({ params: idParam }), getResponseHandler);
assessmentsRouter.get(
  '/:code',
  validate({
    params: codeParam,
    query: z.object({ mode: modeSchema }).optional(),
  }),
  getAssessmentHandler,
);
assessmentsRouter.post(
  '/:code/responses',
  validate({
    params: codeParam,
    body: z.object({
      answers: z.array(answerSchema).min(1).max(120),
      priorities: z.array(z.string().max(80)).max(6).default([]),
      mode: modeSchema,
    }),
  }),
  submitAssessmentHandler,
);
