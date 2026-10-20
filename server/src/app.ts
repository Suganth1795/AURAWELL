import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env, isProd } from './config/env.js';
import { logger } from './utils/logger.js';
import { apiRouter } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', env.TRUST_PROXY);
  app.disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: isProd
        ? { directives: { 'default-src': ["'self'"], 'img-src': ["'self'", 'data:'] } }
        : false,
      crossOriginResourcePolicy: { policy: 'same-site' },
    }),
  );

  app.use(
    cors({
      origin: env.CLIENT_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
    }),
  );

  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export { logger };
