import { z } from 'zod';
import { AGE_GROUP_VALUES } from '../utils/ageGroup.js';

export const emailSchema = z.string().trim().toLowerCase().email().max(200);
export const passwordSchema = z.string().min(8).max(128);

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    displayName: z.string().trim().min(2).max(60),
    birthYear: z
      .number()
      .int()
      .min(new Date().getFullYear() - 110)
      .max(new Date().getFullYear() - 3)
      .optional(),
    ageGroup: z.enum(AGE_GROUP_VALUES as [string, ...string[]]).optional(),
    /** Required when the account belongs to a child (under 13). */
    guardianConsent: z.boolean().default(false),
    guardianName: z.string().trim().max(80).optional(),
    consents: z
      .object({
        termsOfService: z.boolean().default(false),
        privacyPolicy: z.boolean().default(false),
        aiWellnessData: z.boolean().default(false),
      })
      .default({ termsOfService: false, privacyPolicy: false, aiWellnessData: false }),
  })
  .refine((data) => data.birthYear !== undefined || data.ageGroup !== undefined, {
    message: 'Provide birthYear or ageGroup',
    path: ['birthYear'],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

export const requestPasswordResetSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z.object({
  token: z.string().min(32).max(128),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: passwordSchema,
});

export const onboardingSchema = z.object({
  displayName: z.string().trim().min(2).max(60).optional(),
  interests: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
  goals: z.array(z.string().trim().min(1).max(60)).max(6).default([]),
  preferredActivities: z
    .array(z.enum(['games', 'journal', 'movement', 'breathing', 'reflection', 'sleep']))
    .max(6)
    .default([]),
  accessibility: z
    .object({
      fontScale: z.number().min(0.85).max(1.6).optional(),
      contrast: z.enum(['default', 'high', 'dark']).optional(),
      audioInstructions: z.boolean().optional(),
      reduceMotion: z.boolean().optional(),
    })
    .default({}),
  notifications: z
    .object({
      dailyCheckIn: z.boolean().optional(),
      weeklySummary: z.boolean().optional(),
      habitReminders: z.boolean().optional(),
    })
    .default({}),
});

export const preferencesSchema = z.object({
  theme: z.enum(['system', 'light', 'dark']).optional(),
  contrast: z.enum(['default', 'high', 'dark']).optional(),
  fontScale: z.number().min(0.85).max(1.6).optional(),
  reduceMotion: z.boolean().optional(),
  audioInstructions: z.boolean().optional(),
  notifications: z
    .object({
      dailyCheckIn: z.boolean().optional(),
      weeklySummary: z.boolean().optional(),
      habitReminders: z.boolean().optional(),
    })
    .optional(),
  aiWellnessDataConsent: z.boolean().optional(),
  journalAiConsent: z.boolean().optional(),
  timezone: z.string().trim().max(64).optional(),
  avatar: z.object({ emoji: z.string().max(8), color: z.string().max(20) }).optional(),
});

export const consentSchema = z.object({
  type: z.enum(['terms_of_service', 'privacy_policy', 'ai_wellness_data', 'guardian_minor', 'journal_ai']),
  granted: z.boolean(),
  version: z.string().min(1).max(20),
  source: z.enum(['self', 'guardian']).default('self'),
  note: z.string().max(500).optional(),
});
