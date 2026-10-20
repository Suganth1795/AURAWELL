import type { RequestHandler } from 'express';
import { z } from 'zod';
import { requireUser } from '../middleware/auth.js';
import { ConsentRecord, Goal, toUserPublicDto, User, type ConsentType } from '../models/index.js';
import { ok } from '../utils/http.js';
import { HttpError } from '../middleware/error.js';
import { onboardingSchema, preferencesSchema } from '../validators/auth.validators.js';
import { ageGroupFromAge } from '../utils/ageGroup.js';
import { verifyPassword } from '../utils/password.js';

export const getProfileHandler: RequestHandler = (req, res) => {
  const user = requireUser(req);
  ok(res, { user: toUserPublicDto(user) });
};

export const updatePreferencesHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const patch = req.body as z.infer<typeof preferencesSchema>;
    const prefs = user.preferences as any;

    if (patch.theme !== undefined) prefs.theme = patch.theme;
    if (patch.contrast !== undefined) prefs.contrast = patch.contrast;
    if (patch.fontScale !== undefined) prefs.fontScale = patch.fontScale;
    if (patch.reduceMotion !== undefined) prefs.reduceMotion = patch.reduceMotion;
    if (patch.audioInstructions !== undefined) prefs.audioInstructions = patch.audioInstructions;
    if (patch.aiWellnessDataConsent !== undefined)
      prefs.aiWellnessDataConsent = patch.aiWellnessDataConsent;
    if (patch.journalAiConsent !== undefined) prefs.journalAiConsent = patch.journalAiConsent;
    if (patch.notifications) Object.assign(prefs.notifications, patch.notifications);
    if (patch.timezone !== undefined) user.timezone = patch.timezone;
    if (patch.avatar !== undefined) {
      user.wellness.avatar.emoji = patch.avatar.emoji;
      user.wellness.avatar.color = patch.avatar.color;
    }
    await user.save();
    ok(res, { user: toUserPublicDto(user) });
  } catch (error) {
    next(error);
  }
};

export const completeOnboardingHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const body = req.body as z.infer<typeof onboardingSchema>;

    if (body.displayName) user.displayName = body.displayName;
    const prefs = user.preferences as any;
    if (body.notifications) Object.assign(prefs.notifications, body.notifications);
    if (body.accessibility.fontScale !== undefined) prefs.fontScale = body.accessibility.fontScale;
    if (body.accessibility.contrast !== undefined) prefs.contrast = body.accessibility.contrast;
    if (body.accessibility.audioInstructions !== undefined)
      prefs.audioInstructions = body.accessibility.audioInstructions;
    if (body.accessibility.reduceMotion !== undefined)
      prefs.reduceMotion = body.accessibility.reduceMotion;

    user.onboardingCompleted = true;
    user.markModified('preferences');
    await user.save();

    // Selected onboarding goals become user goals (source: onboarding).
    for (const title of body.goals) {
      await Goal.updateOne(
        { userId: user.id, title, status: 'active' },
        { $setOnInsert: { userId: user.id, title, category: 'custom', source: 'self', status: 'active' } },
        { upsert: true },
      );
    }

    ok(res, {
      user: toUserPublicDto(user),
      onboarding: {
        interests: body.interests,
        goals: body.goals,
        preferredActivities: body.preferredActivities,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listConsentHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const records = await ConsentRecord.find({ userId: user.id }).sort({ createdAt: -1 });
    ok(res, {
      consents: records.map((r) => ({
        id: r.id,
        type: r.type,
        granted: r.granted,
        version: r.version,
        source: r.source,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const recordConsentHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const body = req.body as {
      type: ConsentType;
      granted: boolean;
      version: string;
      source?: 'self' | 'guardian';
      note?: string;
    };

    // Minors cannot self-grant guardian/ai consent; guardian records require an adult account
    // in this project build. See docs/security.md for the production guardian workflow.
    if (user.ageGroup === 'child' && body.source !== 'guardian') {
      throw new HttpError(403, 'Consent for child accounts must be recorded by a guardian', 'guardian_required');
    }

    const record = await ConsentRecord.create({
      userId: user.id,
      type: body.type,
      granted: body.granted,
      version: body.version,
      source: body.source ?? 'self',
      note: body.note,
    });
    ok(res, { consent: { id: record.id, type: record.type, granted: record.granted } });
  } catch (error) {
    next(error);
  }
};

export const updateAccountHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const { displayName, birthYear } = req.body as { displayName?: string; birthYear?: number };
    if (displayName) user.displayName = displayName;
    if (birthYear !== undefined) {
      const currentYear = new Date().getFullYear();
      if (birthYear < currentYear - 110 || birthYear > currentYear - 3) {
        throw new HttpError(400, 'Birth year is out of range', 'invalid_birth_year');
      }
      user.birthYear = birthYear;
      if (user.birthYear) {
        const nextGroup = ageGroupFromAge(new Date().getFullYear() - user.birthYear);
        // Age-group changes only ever apply stricter age gating; child stays child-checked.
        user.ageGroup = nextGroup;
      }
    }
    await user.save();
    ok(res, { user: toUserPublicDto(user) });
  } catch (error) {
    next(error);
  }
};

export const getGoalsHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const goals = await Goal.find({ userId: user.id, status: { $ne: 'archived' } })
      .sort({ createdAt: -1 })
      .limit(50);
    ok(res, {
      goals: goals.map((g) => ({
        id: g.id,
        title: g.title,
        description: g.description,
        category: g.category,
        status: g.status,
        progress: g.progress,
        source: g.source,
        targetDate: g.targetDate ?? null,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const createGoalHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const { title, description, category, targetDate } = req.body as {
      title: string;
      description?: string;
      category?: 'sleep' | 'movement' | 'mindfulness' | 'social' | 'focus' | 'habits' | 'custom';
      targetDate?: string;
    };
    if (!title || title.trim().length < 3) {
      throw new HttpError(400, 'Goal title must be at least 3 characters', 'invalid_goal');
    }
    const goal = await Goal.create({
      userId: user.id,
      title: title.trim(),
      description,
      category: category ?? 'custom',
      targetDate,
    });
    ok(res, {
      goal: {
        id: goal.id,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        status: goal.status,
        progress: goal.progress,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateGoalHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const goal = await Goal.findOne({ _id: req.params.id, userId: user.id });
    if (!goal) throw new HttpError(404, 'Goal not found', 'not_found');
    const body = req.body as { status?: string; progress?: number; title?: string };
    if (body.status) {
      goal.status = body.status as 'active' | 'completed' | 'archived';
      if (goal.status === 'completed') goal.completedAt = new Date();
    }
    if (body.progress !== undefined) goal.progress = Math.max(0, Math.min(100, body.progress));
    if (body.title) goal.title = body.title;
    await goal.save();
    ok(res, { goal: { id: goal.id, title: goal.title, status: goal.status, progress: goal.progress } });
  } catch (error) {
    next(error);
  }
};

export const deleteAccountHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const { password } = req.body as { password?: string };
    const full = await User.findById(user.id).select('+passwordHash');
    if (!full || !password || !(await verifyPassword(password, full.passwordHash))) {
      throw new HttpError(400, 'Password confirmation is required', 'password_required');
    }
    full.status = 'deleted';
    full.deletedAt = new Date();
    full.email = `deleted+${full.id}@aurawell.invalid`;
    full.markModified('email');
    await full.save();
    await new Promise<void>((resolve) => req.session.destroy(() => resolve()));
    res.clearCookie('aurawell.sid', { path: '/' });
    ok(res, { deleted: true });
  } catch (error) {
    next(error);
  }
};
