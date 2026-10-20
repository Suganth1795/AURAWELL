import { Router } from 'express';
import { z } from 'zod';
import {
  activitySummaryHandler,
  createActivityHandler,
  deleteActivityHandler,
  listActivityHandler,
} from '../controllers/activity.controller.js';
import {
  createHabitHandler,
  deleteHabitHandler,
  listHabitsHandler,
  toggleHabitHandler,
  updateHabitHandler,
} from '../controllers/habit.controller.js';
import {
  createJournalHandler,
  deleteJournalHandler,
  getJournalHandler,
  listJournalHandler,
  listJournalPromptsHandler,
  updateJournalHandler,
} from '../controllers/journal.controller.js';
import {
  createMoodHandler,
  deleteMoodHandler,
  listMoodHandler,
  moodTrendHandler,
  todayMoodHandler,
} from '../controllers/mood.controller.js';
import {
  createSleepHandler,
  deleteSleepHandler,
  listSleepHandler,
  sleepSummaryHandler,
} from '../controllers/sleep.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ACTIVITY_TYPES, MOOD_VALUES } from '../models/index.js';

export const wellnessRouter = Router();

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');
const idParam = z.object({ id: objectId });
const dayKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');
const rangeQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  from: dayKeySchema.optional(),
  to: dayKeySchema.optional(),
  tag: z.string().trim().max(40).optional(),
  search: z.string().trim().max(80).optional(),
});

wellnessRouter.use(requireAuth);

// Mood
wellnessRouter.post(
  '/mood',
  validate({
    body: z.object({
      mood: z.enum(MOOD_VALUES),
      intensity: z.number().int().min(1).max(5).optional(),
      note: z.string().trim().max(500).optional(),
      activities: z.array(z.string().trim().max(40)).max(20).optional(),
      recordedAt: z.string().datetime().optional(),
    }),
  }),
  createMoodHandler,
);
wellnessRouter.get('/mood/today', todayMoodHandler);
wellnessRouter.get('/mood/trend', moodTrendHandler);
wellnessRouter.get('/mood', validate({ query: rangeQuery }), listMoodHandler);
wellnessRouter.delete('/mood/:id', validate({ params: idParam }), deleteMoodHandler);

// Journal
wellnessRouter.get('/journal/prompts', listJournalPromptsHandler);
wellnessRouter.post(
  '/journal',
  validate({
    body: z.object({
      title: z.string().trim().max(120).optional(),
      content: z.string().trim().min(1).max(10_000),
      tags: z.array(z.string().trim().max(40)).max(20).optional(),
      promptId: z.string().trim().max(60).optional(),
    }),
  }),
  createJournalHandler,
);
wellnessRouter.get('/journal', validate({ query: rangeQuery }), listJournalHandler);
wellnessRouter.get('/journal/:id', validate({ params: idParam }), getJournalHandler);
wellnessRouter.patch(
  '/journal/:id',
  validate({
    params: idParam,
    body: z.object({
      title: z.string().trim().max(120).optional(),
      content: z.string().trim().min(1).max(10_000).optional(),
      tags: z.array(z.string().trim().max(40)).max(20).optional(),
    }),
  }),
  updateJournalHandler,
);
wellnessRouter.delete('/journal/:id', validate({ params: idParam }), deleteJournalHandler);

// Sleep
wellnessRouter.post(
  '/sleep',
  validate({
    body: z.object({
      dayKey: dayKeySchema.optional(),
      startTime: z.string().datetime(),
      endTime: z.string().datetime(),
      quality: z.number().int().min(1).max(5),
      notes: z.string().trim().max(500).optional(),
    }),
  }),
  createSleepHandler,
);
wellnessRouter.get('/sleep/summary', sleepSummaryHandler);
wellnessRouter.get('/sleep', validate({ query: rangeQuery }), listSleepHandler);
wellnessRouter.delete('/sleep/:id', validate({ params: idParam }), deleteSleepHandler);

// Activity
wellnessRouter.post(
  '/activity',
  validate({
    body: z.object({
      type: z.enum(ACTIVITY_TYPES),
      durationMinutes: z.number().int().min(1).max(1440),
      steps: z.number().int().min(0).max(200_000).optional(),
      notes: z.string().trim().max(500).optional(),
      occurredAt: z.string().datetime().optional(),
    }),
  }),
  createActivityHandler,
);
wellnessRouter.get('/activity/summary', activitySummaryHandler);
wellnessRouter.get('/activity', validate({ query: rangeQuery }), listActivityHandler);
wellnessRouter.delete('/activity/:id', validate({ params: idParam }), deleteActivityHandler);

// Habits
wellnessRouter.get('/habits', listHabitsHandler);
wellnessRouter.post(
  '/habits',
  validate({
    body: z.object({
      name: z.string().trim().min(2).max(80),
      description: z.string().trim().max(300).optional(),
      category: z.enum(['sleep', 'movement', 'mindfulness', 'social', 'focus', 'custom']).optional(),
      frequency: z.enum(['daily', 'weekly', 'custom']).optional(),
      targetPerPeriod: z.number().int().min(1).max(7).optional(),
      reminderTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
      emoji: z.string().trim().max(8).optional(),
      startDate: dayKeySchema.optional(),
    }),
  }),
  createHabitHandler,
);
wellnessRouter.patch(
  '/habits/:id',
  validate({
    params: idParam,
    body: z.object({
      name: z.string().trim().min(2).max(80).optional(),
      description: z.string().trim().max(300).optional(),
      category: z.enum(['sleep', 'movement', 'mindfulness', 'social', 'focus', 'custom']).optional(),
      frequency: z.enum(['daily', 'weekly', 'custom']).optional(),
      targetPerPeriod: z.number().int().min(1).max(7).optional(),
      reminderTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
      emoji: z.string().trim().max(8).optional(),
      archived: z.boolean().optional(),
    }),
  }),
  updateHabitHandler,
);
wellnessRouter.post(
  '/habits/:id/entries',
  validate({
    params: idParam,
    body: z.object({
      completed: z.boolean(),
      dayKey: dayKeySchema.optional(),
      note: z.string().trim().max(300).optional(),
    }),
  }),
  toggleHabitHandler,
);
wellnessRouter.delete('/habits/:id', validate({ params: idParam }), deleteHabitHandler);
