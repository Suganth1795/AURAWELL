import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

export const CONSENT_TYPES = [
  'terms_of_service',
  'privacy_policy',
  'ai_wellness_data',
  'guardian_minor',
  'journal_ai',
] as const;

export type ConsentType = (typeof CONSENT_TYPES)[number];

const consentRecordSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: CONSENT_TYPES, required: true },
    granted: { type: Boolean, required: true },
    version: { type: String, required: true, maxlength: 20 },
    source: { type: String, enum: ['self', 'guardian'], default: 'self' },
    note: { type: String, maxlength: 500 },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

consentRecordSchema.index({ userId: 1, type: 1, createdAt: -1 });

export type ConsentRecordDoc = HydratedDocument<InferSchemaType<typeof consentRecordSchema>>;

export const ConsentRecord = model('ConsentRecord', consentRecordSchema);
