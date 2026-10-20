import pino from 'pino';
import { env, isProd } from '../config/env.js';

export const logger = pino({
  level: isProd ? 'info' : 'debug',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      '*.password',
      'body.password',
      'apiKey',
      '*.apiKey',
    ],
    censor: '[REDACTED]',
  },
  base: { env: env.NODE_ENV, service: 'aurawell-server' },
});
