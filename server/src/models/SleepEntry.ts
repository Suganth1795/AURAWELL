import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const sleepEntrySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    /** Calendar date (YYYY-MM-DD) the sleep period is attributed to (wake day). */
    dayKey: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    durationMinutes: { type: Number, required: true, min: 1, max: 1440 },
    quality: { type: Number, min: 1, max: 5, required: true },
    notes: { type: String, maxlength: 500 },
    source: { type: String, enum: ['manual', 'device'], default: 'manual' },
  },
  { timestamps: true },
);

sleepEntrySchema.index({ userId: 1, dayKey: -1 });
sleepEntrySchema.index({ userId: 1, startTime: -1 });

export type SleepEntryDoc = HydratedDocument<InferSchemaType<typeof sleepEntrySchema>>;

export const SleepEntry = model('SleepEntry', sleepEntrySchema);
