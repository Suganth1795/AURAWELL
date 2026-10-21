import { Router } from 'express';
import { apiLimiter } from '../middleware/rateLimit.js';
import { csrfMiddleware } from '../middleware/csrf.js';
import { createSessionMiddleware } from '../config/session.js';
import { authRouter } from './auth.routes.js';
import { usersRouter } from './users.routes.js';
import { assessmentsRouter } from './assessments.routes.js';
import { gamesRouter } from './games.routes.js';
import { wellnessRouter } from './wellness.routes.js';
import { recommendationsRouter } from './recommendations.routes.js';
import { counselingRouter } from './counseling.routes.js';
import { aiRouter } from './ai.routes.js';
import { analyticsRouter } from './analytics.routes.js';
import { privacyRouter } from './privacy.routes.js';

export const apiRouter = Router();

const sessionMiddleware = createSessionMiddleware();

apiRouter.use(apiLimiter);
apiRouter.use(sessionMiddleware);
apiRouter.use(csrfMiddleware);

// Safe endpoint that also issues the CSRF cookie for the client.
apiRouter.get('/csrf', (_req, res) => {
  res.json({ data: { csrf: true } });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/assessments', assessmentsRouter);
apiRouter.use('/games', gamesRouter);
apiRouter.use('/wellness', wellnessRouter);
apiRouter.use('/recommendations', recommendationsRouter);
apiRouter.use('/counseling', counselingRouter);
apiRouter.use('/ai', aiRouter);
apiRouter.use('/analytics', analyticsRouter);
apiRouter.use('/privacy', privacyRouter);
