import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const answerSchema = new Schema(
  {
    questionId: { type: String, required: true },
    optionIds: { type: [String], default: undefined },
    value: { type: Number, default: undefined },
    text: { type: String, default: undefined, maxlength: 500 },
  },
  { _id: false },
);

const assessmentResponseSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assessmentCode: { type: String, required: true },
    assessmentVersion: { type: String, required: true },
    answers: { type: [answerSchema], required: true },
    tags: { type: [String], default: [] },
    tagWeights: { type: Schema.Types.Mixed, default: {} },
    matchedRules: { type: [String], default: [] },
    priorities: { type: [String], default: [] },
    summary: { type: String, default: '' },
    indicators: { type: Schema.Types.Mixed, default: {} },
    suggestions: {
      type: [
        {
          kind: {
            type: String,
            enum: ['game', 'habit', 'journal_prompt', 'sleep_routine', 'activity', 'reflection', 'breathing'],
          },
          code: String,
          title: String,
          explanation: String,
          _id: false,
        },
      ],
      default: [],
    },
    sevenDayPlan: {
      type: [
        {
          day: Number,
          focus: String,
          actions: [String],
          _id: false,
        },
      ],
      default: [],
    },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

assessmentResponseSchema.index({ userId: 1, assessmentCode: 1, completedAt: -1 });
assessmentResponseSchema.index({ userId: 1, completedAt: -1 });

export type AssessmentResponseDoc = HydratedDocument<InferSchemaType<typeof assessmentResponseSchema>>;

export const AssessmentResponse = model('AssessmentResponse', assessmentResponseSchema);
