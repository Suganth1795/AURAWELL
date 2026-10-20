import { Router } from 'express';
import { z } from 'zod';
import {
  gameStatsHandler,
  getGameHandler,
  listGamesHandler,
  listGameSessionsHandler,
  submitGameResultHandler,
} from '../controllers/game.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const gamesRouter = Router();

const codeParam = z.object({ code: z.string().trim().min(2).max(40) });

const resultBody = z.object({
  gameCode: z.string().trim().min(2).max(40),
  difficulty: z.number().int().min(1).max(5).default(1),
  score: z.number().min(0).max(100_000),
  maxScore: z.number().min(0).max(100_000),
  durationSeconds: z.number().min(0).max(7200).default(0),
  completed: z.boolean().default(false),
  summary: z.record(z.string(), z.unknown()).optional(),
  idempotencyKey: z.string().trim().min(1).max(120).optional(),
});

gamesRouter.use(requireAuth);

gamesRouter.get('/', listGamesHandler);
gamesRouter.get('/sessions', listGameSessionsHandler);
gamesRouter.get('/stats', gameStatsHandler);
gamesRouter.get('/:code', validate({ params: codeParam }), getGameHandler);
gamesRouter.post('/sessions', validate({ body: resultBody }), submitGameResultHandler);
