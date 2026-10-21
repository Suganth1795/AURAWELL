import { Schema, model, type HydratedDocument } from 'mongoose';
import type { AgeGroup } from '../utils/ageGroup.js';

export interface UserPreferences {
  theme: 'system' | 'light' | 'dark';
  contrast: 'default' | 'high' | 'dark';
  fontScale: number;
  reduceMotion: boolean;
  audioInstructions: boolean;
  notifications: {
    dailyCheckIn: boolean;
    weeklySummary: boolean;
    habitReminders: boolean;
  };
  aiWellnessDataConsent: boolean;
  journalAiConsent: boolean;
}

export interface UserWellness {
  xp: number;
  level: number;
  streakDays: number;
  longestStreak: number;
  lastActiveDay: string | null;
  avatar: { emoji: string; color: string };
  /** UTC day the game XP counter below belongs to; resets when the day changes. */
  gameXpDay: string | null;
  /** Game XP granted so far on `gameXpDay`, used to cap farming. */
  gameXpToday: number;
}

export interface UserInterface {
  _id: import('mongoose').Types.ObjectId;
  email: string;
  passwordHash: string;
  displayName: string;
  birthYear?: number | null;
  ageGroup: AgeGroup;
  role: 'user' | 'admin';
  timezone: string;
  onboardingCompleted: boolean;
  wellness: UserWellness;
  preferences: UserPreferences;
  status: 'active' | 'deleted';
  deletedAt?: Date | null;
  passwordResetTokenHash?: string | null;
  passwordResetExpires?: Date | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const preferencesSchema = new Schema<UserPreferences>(
  {
    theme: { type: String, enum: ['system', 'light', 'dark'], default: 'system' },
    contrast: { type: String, enum: ['default', 'high', 'dark'], default: 'default' },
    fontScale: { type: Number, min: 0.85, max: 1.6, default: 1 },
    reduceMotion: { type: Boolean, default: false },
    audioInstructions: { type: Boolean, default: false },
    notifications: {
      type: new Schema<UserPreferences['notifications']>(
        {
          dailyCheckIn: { type: Boolean, default: true },
          weeklySummary: { type: Boolean, default: true },
          habitReminders: { type: Boolean, default: true },
        },
        { _id: false },
      ),
      default: () => ({}),
    },
    aiWellnessDataConsent: { type: Boolean, default: false },
    journalAiConsent: { type: Boolean, default: false },
  },
  { _id: false },
);

const wellnessSchema = new Schema<UserWellness>(
  {
    xp: { type: Number, default: 0, min: 0 },
    level: { type: Number, default: 1, min: 1 },
    streakDays: { type: Number, default: 0, min: 0 },
    longestStreak: { type: Number, default: 0, min: 0 },
    lastActiveDay: { type: String, default: null },
    gameXpDay: { type: String, default: null },
    gameXpToday: { type: Number, default: 0, min: 0 },
    avatar: {
      type: new Schema<UserWellness['avatar']>(
        {
          emoji: { type: String, default: '🌱' },
          color: { type: String, default: 'violet' },
        },
        { _id: false },
      ),
      default: () => ({}),
    },
  },
  { _id: false },
);

const userSchema = new Schema<UserInterface>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    passwordHash: { type: String, required: true, select: false },
    displayName: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    birthYear: { type: Number, min: 1900, max: 2100 },
    ageGroup: {
      type: String,
      enum: ['child', 'teen', 'adult', 'older_adult'],
      required: true,
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    timezone: { type: String, default: 'UTC', maxlength: 64 },
    onboardingCompleted: { type: Boolean, default: false },
    wellness: { type: wellnessSchema, default: () => ({}) },
    preferences: { type: preferencesSchema, default: () => ({}) },
    status: { type: String, enum: ['active', 'deleted'], default: 'active' },
    deletedAt: { type: Date, default: null },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as Record<string, unknown>).passwordHash;
        delete (ret as Record<string, unknown>).passwordResetTokenHash;
        delete (ret as Record<string, unknown>).passwordResetExpires;
        return ret;
      },
    },
  },
);

userSchema.index({ status: 1, createdAt: -1 });

export type UserDoc = HydratedDocument<UserInterface>;

export interface UserPublicDto {
  id: string;
  email: string;
  displayName: string;
  ageGroup: AgeGroup;
  birthYear: number | null;
  role: 'user' | 'admin';
  timezone: string;
  onboardingCompleted: boolean;
  wellness: {
    xp: number;
    level: number;
    streakDays: number;
    longestStreak: number;
    avatar: { emoji: string; color: string };
  };
  preferences: {
    theme: 'system' | 'light' | 'dark';
    contrast: 'default' | 'high' | 'dark';
    fontScale: number;
    reduceMotion: boolean;
    audioInstructions: boolean;
    notifications: { dailyCheckIn: boolean; weeklySummary: boolean; habitReminders: boolean };
    aiWellnessDataConsent: boolean;
    journalAiConsent: boolean;
  };
  createdAt: string;
}

export function toUserPublicDto(user: UserDoc): UserPublicDto {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    ageGroup: user.ageGroup,
    birthYear: user.birthYear ?? null,
    role: user.role,
    timezone: user.timezone,
    onboardingCompleted: user.onboardingCompleted,
    wellness: {
      xp: user.wellness.xp,
      level: user.wellness.level,
      streakDays: user.wellness.streakDays,
      longestStreak: user.wellness.longestStreak,
      avatar: {
        emoji: user.wellness.avatar.emoji,
        color: user.wellness.avatar.color,
      },
    },
    preferences: {
      theme: user.preferences.theme,
      contrast: user.preferences.contrast,
      fontScale: user.preferences.fontScale,
      reduceMotion: user.preferences.reduceMotion,
      audioInstructions: user.preferences.audioInstructions,
      notifications: {
        dailyCheckIn: user.preferences.notifications.dailyCheckIn,
        weeklySummary: user.preferences.notifications.weeklySummary,
        habitReminders: user.preferences.notifications.habitReminders,
      },
      aiWellnessDataConsent: user.preferences.aiWellnessDataConsent,
      journalAiConsent: user.preferences.journalAiConsent,
    },
    createdAt: user.createdAt.toISOString(),
  };
}

export const User = model('User', userSchema);
