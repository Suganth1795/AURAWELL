import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const habitSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, maxlength: 80 },
    description: { type: String, maxlength: 300 },
    category: {
      type: String,
      enum: ['sleep', 'movement', 'mindfulness', 'social', 'focus', 'custom'],
      default: 'custom',
    },
    frequency: { type: String, enum: ['daily', 'weekly', 'custom'], default: 'daily' },
    /** For weekly: completions expected per week (1-7). For custom: per ISO week. */
    targetPerPeriod: { type: Number, min: 1, max: 7, default: 1 },
    reminderTime: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    emoji: { type: String, default: '✅' },
    archived: { type: Boolean, default: false },
    startDate: { type: String, required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

habitSchema.index({ userId: 1, deletedAt: 1, archived: 1 });

export type HabitDoc = HydratedDocument<InferSchemaType<typeof habitSchema>>;

export const Habit = model('Habit', habitSchema);

const habitEntrySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    habitId: { type: Schema.Types.ObjectId, ref: 'Habit', required: true },
    dayKey: { type: String, required: true },
    completed: { type: Boolean, default: true },
    note: { type: String, maxlength: 300 },
  },
  { timestamps: true },
);

habitEntrySchema.index({ habitId: 1, dayKey: 1 }, { unique: true });
habitEntrySchema.index({ userId: 1, dayKey: -1 });

export type HabitEntryDoc = HydratedDocument<InferSchemaType<typeof habitEntrySchema>>;

export const HabitEntry = model('HabitEntry', habitEntrySchema);
