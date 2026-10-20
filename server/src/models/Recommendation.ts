import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

export const RECOMMENDATION_KINDS = [
  'game',
  'habit',
  'journal_prompt',
  'sleep_routine',
  'activity',
  'reflection',
  'breathing',
  'goal',
] as const;

const recommendationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    kind: { type: String, enum: RECOMMENDATION_KINDS, required: true },
    code: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    explanation: { type: String, required: true },
    estimatedMinutes: { type: Number, default: 5 },
    ageGroups: {
      type: [{ type: String, enum: ['child', 'teen', 'adult', 'older_adult'] }],
      default: [],
    },
    source: { type: String, enum: ['assessment', 'rules', 'ai', 'user'], required: true },
    sourceRef: { type: String },
    score: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['suggested', 'accepted', 'dismissed', 'completed'],
      default: 'suggested',
    },
    feedbackHelpful: { type: Boolean, default: null },
    dismissedAt: { type: Date },
  },
  { timestamps: true },
);

recommendationSchema.index({ userId: 1, status: 1, score: -1 });
recommendationSchema.index({ userId: 1, kind: 1, code: 1, status: 1 });

export type RecommendationDoc = HydratedDocument<InferSchemaType<typeof recommendationSchema>>;

export const Recommendation = model('Recommendation', recommendationSchema);
