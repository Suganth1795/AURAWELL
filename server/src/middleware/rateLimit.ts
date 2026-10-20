import { rateLimit } from 'express-rate-limit';
import { env, isTest } from '../config/env.js';

function limiter(windowMs: number, max: number, message: string) {
  return rateLimit({
    windowMs,
    max: isTest ? 10_000 : max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { message, code: 'rate_limited' } },
  });
}

export const apiLimiter = limiter(
  env.RATE_LIMIT_WINDOW_MS,
  env.RATE_LIMIT_MAX,
  'Too many requests, please try again later.',
);

export const authLimiter = limiter(
  env.AUTH_RATE_LIMIT_WINDOW_MS,
  env.AUTH_RATE_LIMIT_MAX,
  'Too many authentication attempts, please try again later.',
);
