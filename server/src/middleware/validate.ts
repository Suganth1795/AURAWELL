import type { RequestHandler } from 'express';
import { ZodError, type ZodType } from 'zod';

type Schemas = {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
};

/**
 * Validates untrusted request input with zod and replaces the parsed values.
 */
export function validate(schemas: Schemas): RequestHandler {
  return (req, _res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) {
        const parsed = schemas.query.parse(req.query);
        Object.assign(req.query as Record<string, unknown>, parsed);
      }
      if (schemas.params) {
        const parsed = schemas.params.parse(req.params);
        Object.assign(req.params as Record<string, unknown>, parsed);
      }
      next();
    } catch (error) {
      next(error instanceof ZodError ? error : error);
    }
  };
}
