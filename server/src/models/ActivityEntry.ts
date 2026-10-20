import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

export const ACTIVITY_TYPES = [
  'walk',
  'run',
  'cycle',
  'yoga',
  'strength',
  'sport',
  'stretch',
  'dance',
  'other',
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

const activityEntrySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dayKey: { type: String, required: true },
    type: { type: String, enum: ACTIVITY_TYPES, required: true },
    durationMinutes: { type: Number, required: true, min: 1, max: 1440 },
    steps: { type: Number, min: 0, max: 200_000 },
    notes: { type: String, maxlength: 500 },
    source: { type: String, enum: ['manual', 'device'], default: 'manual' },
    occurredAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

activityEntrySchema.index({ userId: 1, dayKey: -1 });
activityEntrySchema.index({ userId: 1, occurredAt: -1 });

export type ActivityEntryDoc = HydratedDocument<InferSchemaType<typeof activityEntrySchema>>;

export const ActivityEntry = model('ActivityEntry', activityEntrySchema);
