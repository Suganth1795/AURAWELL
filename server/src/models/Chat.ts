import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const chatSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, maxlength: 120, default: 'New conversation' },
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
    ageGroup: {
      type: String,
      enum: ['child', 'teen', 'adult', 'older_adult'],
      required: true,
    },
    safetyFlags: { type: [String], default: [] },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

chatSessionSchema.index({ userId: 1, lastMessageAt: -1 });

export type ChatSessionDoc = HydratedDocument<InferSchemaType<typeof chatSessionSchema>>;

export const ChatSession = model('ChatSession', chatSessionSchema);

const chatMessageSchema = new Schema(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'ChatSession', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true, maxlength: 4000 },
    safetyLevel: {
      type: String,
      enum: ['none', 'crisis_support', 'boundary_redirect'],
      default: 'none',
    },
    source: { type: String, enum: ['llm', 'fallback', 'canned'], default: 'llm' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

chatMessageSchema.index({ sessionId: 1, createdAt: 1 });
chatMessageSchema.index({ userId: 1, createdAt: -1 });

export type ChatMessageDoc = HydratedDocument<InferSchemaType<typeof chatMessageSchema>>;

export const ChatMessage = model('ChatMessage', chatMessageSchema);
