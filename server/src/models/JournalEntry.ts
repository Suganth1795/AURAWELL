import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const journalEntrySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, maxlength: 120 },
    content: { type: String, required: true, maxlength: 10_000 },
    tags: { type: [String], maxlength: 40, default: [] },
    promptId: { type: String },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

journalEntrySchema.index({ userId: 1, createdAt: -1 });
journalEntrySchema.index({ userId: 1, deletedAt: 1, createdAt: -1 });

export type JournalEntryDoc = HydratedDocument<InferSchemaType<typeof journalEntrySchema>>;

export const JournalEntry = model('JournalEntry', journalEntrySchema);
