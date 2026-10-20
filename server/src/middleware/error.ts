import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ error: { message: 'Route not found', code: 'not_found', path: req.path } });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        message: 'Validation failed',
        code: 'validation_error',
        details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      },
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: { message: err.message, code: err.code ?? 'error', details: err.details },
    });
    return;
  }

  // Body parser syntax errors from express.json()
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: { message: 'Malformed JSON body', code: 'invalid_json' } });
    return;
  }

  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: { message: 'Internal server error', code: 'internal_error' } });
};
