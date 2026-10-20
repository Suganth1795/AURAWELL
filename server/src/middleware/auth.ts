import type { RequestHandler } from 'express';
import { User, toUserPublicDto, type UserDoc } from '../models/index.js';
import { HttpError } from './error.js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: UserDoc;
  }
}

/** Loads the session user onto req.user; rejects when missing or deleted. */
export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      throw new HttpError(401, 'Authentication required', 'unauthenticated');
    }
    const user = await User.findById(userId);
    if (!user || user.status !== 'active') {
      req.session.destroy(() => undefined);
      throw new HttpError(401, 'Authentication required', 'unauthenticated');
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/** Loads req.user when a valid session exists, but never rejects. */
export const optionalAuth: RequestHandler = async (req, _res, next) => {
  try {
    const userId = req.session.userId;
    if (userId) {
      const user = await User.findById(userId);
      if (user && user.status === 'active') req.user = user;
    }
    next();
  } catch (error) {
    next(error);
  }
};

export function requireUser(req: { user?: UserDoc }): UserDoc {
  if (!req.user) throw new HttpError(401, 'Authentication required', 'unauthenticated');
  return req.user;
}

export function userDto(user: UserDoc) {
  return toUserPublicDto(user);
}
