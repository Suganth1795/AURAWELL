import { randomBytes } from 'node:crypto';
import type { RequestHandler } from 'express';

export const CSRF_COOKIE = 'aurawell_csrf';
export const CSRF_HEADER = 'x-csrf-token';

/**
 * Double-submit cookie CSRF protection.
 * A readable token cookie is issued on safe requests; state-changing requests
 * must echo it in the X-CSRF-Token header (which cross-site forms cannot set).
 */
export const csrfMiddleware: RequestHandler = (req, res, next) => {
  const existing = req.cookies?.[CSRF_COOKIE] as string | undefined;
  const token = existing && existing.length >= 32 ? existing : randomBytes(32).toString('hex');
  if (token !== existing) {
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    next();
    return;
  }

  const header = req.get(CSRF_HEADER);
  if (!header || !token || header !== token) {
    res.status(403).json({
      error: { message: 'Invalid or missing CSRF token', code: 'csrf_invalid' },
    });
    return;
  }
  next();
};
