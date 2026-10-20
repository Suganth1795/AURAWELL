import { Recommendation, type UserDoc } from '../models/index.js';
import { HttpError } from '../middleware/error.js';

export interface RecommendationDto {
  id: string;
  kind: string;
  code: string;
  title: string;
  description: string;
  explanation: string;
  estimatedMinutes: number;
  source: string;
  score: number;
  status: 'suggested' | 'accepted' | 'dismissed' | 'completed';
  feedbackHelpful: boolean | null;
  createdAt: string;
  completedAt: string | null;
}

function toDto(doc: {
  _id: unknown;
  kind: string;
  code: string;
  title: string;
  description: string;
  explanation: string;
  estimatedMinutes: number;
  source: string;
  score: number;
  status: RecommendationDto['status'];
  feedbackHelpful?: boolean | null;
  createdAt: Date;
  completedAt?: Date | null;
}): RecommendationDto {
  return {
    id: String(doc._id),
    kind: doc.kind,
    code: doc.code,
    title: doc.title,
    description: doc.description,
    explanation: doc.explanation,
    estimatedMinutes: doc.estimatedMinutes,
    source: doc.source,
    score: doc.score,
    status: doc.status,
    feedbackHelpful: doc.feedbackHelpful ?? null,
    createdAt: doc.createdAt.toISOString(),
    completedAt: doc.completedAt ? doc.completedAt.toISOString() : null,
  };
}

export async function listRecommendations(
  user: UserDoc,
  options: { status?: RecommendationDto['status']; kind?: string; limit: number },
): Promise<RecommendationDto[]> {
  const filter: Record<string, unknown> = { userId: user._id };
  if (options.status) filter.status = options.status;
  if (options.kind) filter.kind = options.kind;
  const docs = await Recommendation.find(filter).sort({ score: -1, createdAt: -1 }).limit(options.limit);
  return docs.map(toDto);
}

export async function updateRecommendation(
  user: UserDoc,
  id: string,
  input: { status?: RecommendationDto['status']; feedbackHelpful?: boolean },
): Promise<RecommendationDto> {
  const doc = await Recommendation.findOne({ _id: id, userId: user._id });
  if (!doc) throw new HttpError(404, 'Recommendation not found', 'not_found');

  if (input.status) {
    doc.status = input.status;
    if (input.status === 'dismissed') doc.dismissedAt = new Date();
    if (input.status === 'completed') doc.completedAt = new Date();
  }
  if (input.feedbackHelpful !== undefined) doc.feedbackHelpful = input.feedbackHelpful;

  await doc.save();
  return toDto(doc);
}
