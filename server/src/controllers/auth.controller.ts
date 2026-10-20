import type { Request, RequestHandler, Response } from 'express';
import { z } from 'zod';
import {
  authenticateUser,
  changePassword,
  registerUser,
  requestPasswordReset,
  resetPassword,
} from '../services/auth.service.js';
import { toUserPublicDto } from '../models/index.js';
import { requireUser } from '../middleware/auth.js';
import { ok, created } from '../utils/http.js';
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from '../validators/auth.validators.js';

type RegisterBody = z.infer<typeof registerSchema>;

export const registerHandler: RequestHandler = async (req, res, next) => {
  try {
    const body = req.body as RegisterBody;
    const user = await registerUser(body);
    await new Promise<void>((resolve, reject) =>
      req.session.regenerate((err) => (err ? reject(err) : resolve())),
    );
    req.session.userId = user.id;
    created(res, { user: toUserPublicDto(user) });
  } catch (error) {
    next(error);
  }
};

export const loginHandler: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body as z.infer<typeof loginSchema>;
    const user = await authenticateUser(email, password);
    await new Promise<void>((resolve, reject) =>
      req.session.regenerate((err) => (err ? reject(err) : resolve())),
    );
    req.session.userId = user.id;
    ok(res, { user: toUserPublicDto(user) });
  } catch (error) {
    next(error);
  }
};

export const logoutHandler: RequestHandler = async (req, res, next) => {
  try {
    await new Promise<void>((resolve, reject) =>
      req.session.destroy((err) => (err ? reject(err) : resolve())),
    );
    res.clearCookie('aurawell.sid', { path: '/' });
    ok(res, { loggedOut: true });
  } catch (error) {
    next(error);
  }
};

export const meHandler: RequestHandler = (req: Request, res: Response) => {
  const user = requireUser(req);
  ok(res, { user: toUserPublicDto(user) });
};

export const requestPasswordResetHandler: RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.body as z.infer<typeof requestPasswordResetSchema>;
    const result = await requestPasswordReset(email);
    ok(res, {
      requested: true,
      ...(result.devToken ? { devToken: result.devToken } : {}),
    });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordHandler: RequestHandler = async (req, res, next) => {
  try {
    const { token, password } = req.body as z.infer<typeof resetPasswordSchema>;
    await resetPassword(token, password);
    ok(res, { reset: true });
  } catch (error) {
    next(error);
  }
};

export const changePasswordHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const { currentPassword, newPassword } = req.body as z.infer<typeof changePasswordSchema>;
    await changePassword(user, currentPassword, newPassword);
    ok(res, { changed: true });
  } catch (error) {
    next(error);
  }
};
