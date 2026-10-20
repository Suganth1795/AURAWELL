import { Router } from 'express';
import { apiLimiter } from '../middleware/rateLimit.js';
import { csrfMiddleware } from '../middleware/csrf.js';
import { createSessionMiddleware } from '../config/session.js';
import { authRouter } from './auth.routes.js';
import { usersRouter } from './users.routes.js';

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

// Feature routers are mounted here as they are implemented:
// /assessments, /games, /wellness, /recommendations, /ai, /analytics, /privacy
