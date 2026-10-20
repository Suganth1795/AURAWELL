import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

export const MOOD_VALUES = ['great', 'good', 'okay', 'low', 'struggling'] as const;
export type MoodValue = (typeof MOOD_VALUES)[number];

export const MOOD_SCORE: Record<MoodValue, number> = {
  great: 5,
  good: 4,
  okay: 3,
  low: 2,
  struggling: 1,
};

const moodEntrySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    mood: { type: String, enum: MOOD_VALUES, required: true },
    intensity: { type: Number, min: 1, max: 5 },
    note: { type: String, maxlength: 500 },
    activities: { type: [String], maxlength: 40, default: [] },
    recordedAt: { type: Date, default: Date.now },
    dayKey: { type: String, required: true },
  },
  { timestamps: true },
);

moodEntrySchema.index({ userId: 1, recordedAt: -1 });
moodEntrySchema.index({ userId: 1, dayKey: 1 });

export type MoodEntryDoc = HydratedDocument<InferSchemaType<typeof moodEntrySchema>>;

export const MoodEntry = model('MoodEntry', moodEntrySchema);
