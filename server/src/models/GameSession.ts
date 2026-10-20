import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const gameSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gameCode: { type: String, required: true },
    difficulty: { type: Number, min: 1, max: 5, default: 1 },
    score: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    durationSeconds: { type: Number, min: 0, max: 7200, default: 0 },
    completed: { type: Boolean, default: false },
    /** Small game-specific summary (accuracy, rounds, etc). Never diagnostic. */
    summary: { type: Schema.Types.Mixed, default: {} },
    xpAwarded: { type: Number, default: 0, min: 0 },
    rewarded: { type: Boolean, default: false },
    /** Client-generated key preventing duplicate reward grants. */
    idempotencyKey: { type: String },
    playedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

gameSessionSchema.index({ userId: 1, playedAt: -1 });
gameSessionSchema.index({ userId: 1, gameCode: 1, playedAt: -1 });
gameSessionSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true, sparse: true });

export type GameSessionDoc = HydratedDocument<InferSchemaType<typeof gameSessionSchema>>;

export const GameSession = model('GameSession', gameSessionSchema);
