import session from 'express-session';
import type { RequestHandler } from 'express';
import MongoStore from 'connect-mongo';
import { env, isProd } from './env.js';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function createSessionMiddleware(mongoUrl = env.MONGODB_URI): RequestHandler {
  return session({
    name: 'aurawell.sid',
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl,
      collectionName: 'sessions',
      ttl: ONE_WEEK_MS / 1000,
      autoRemove: 'interval',
    }),
    cookie: {
      httpOnly: true,
      sameSite: env.SESSION_COOKIE_SAME_SITE,
      secure: isProd || env.SESSION_COOKIE_SAME_SITE === 'none',
      maxAge: ONE_WEEK_MS,
      path: '/',
    },
  });
}
