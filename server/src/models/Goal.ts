import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const goalSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, maxlength: 100 },
    description: { type: String, maxlength: 400 },
    category: {
      type: String,
      enum: ['sleep', 'movement', 'mindfulness', 'social', 'focus', 'habits', 'custom'],
      default: 'custom',
    },
    source: { type: String, enum: ['assessment', 'self', 'plan'], default: 'self' },
    status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
    targetDate: { type: String },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

goalSchema.index({ userId: 1, status: 1, createdAt: -1 });

export type GoalDoc = HydratedDocument<InferSchemaType<typeof goalSchema>>;

export const Goal = model('Goal', goalSchema);
