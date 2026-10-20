import { Recommendation, type UserDoc } from '../models/index.js';
import { getContentItem } from '../data/wellnessContent.js';
import { ageGroupEligible, type InterpretationResult, type Suggestion } from './assessmentEngine.service.js';

export interface EnrichedSuggestion extends Suggestion {
  title: string;
  description: string;
  estimatedMinutes: number;
}

/**
 * Resolves suggestion codes against the wellness catalogue, applies age
 * eligibility and merges in the user's accessibility-safe defaults.
 */
export function enrichSuggestions(suggestions: Suggestion[], user: UserDoc): EnrichedSuggestion[] {
  const result: EnrichedSuggestion[] = [];
  for (const suggestion of suggestions) {
    const item = getContentItem(suggestion.code);
    if (!item) continue;
    if (!ageGroupEligible(item.ageGroups, user.ageGroup)) continue;
    result.push({
      ...suggestion,
      title: item.title,
      description: item.description,
      estimatedMinutes: item.estimatedMinutes,
    });
  }
  return result;
}

/**
 * Persists fresh recommendations for an assessment result. Existing dismissed
 * or accepted suggestions for the same code are not re-created.
 */
export async function persistAssessmentRecommendations(
  user: UserDoc,
  assessmentCode: string,
  enriched: EnrichedSuggestion[],
): Promise<void> {
  if (enriched.length === 0) return;

  const existing = await Recommendation.find({
    userId: user.id,
    code: { $in: enriched.map((s) => s.code) },
    status: { $in: ['suggested', 'accepted', 'completed'] },
  }).select('code');

  const existingCodes = new Set(existing.map((r) => r.code));

  const toCreate = enriched.filter((s) => !existingCodes.has(s.code));
  if (toCreate.length === 0) return;

  await Recommendation.insertMany(
    toCreate.map((s) => ({
      userId: user.id,
      kind: s.kind,
      code: s.code,
      title: s.title,
      description: s.description,
      explanation: s.explanation,
      estimatedMinutes: s.estimatedMinutes,
      ageGroups: getContentItem(s.code)?.ageGroups ?? [],
      source: 'assessment',
      sourceRef: assessmentCode,
      status: 'suggested',
    })),
  );
}

export function buildResultDto(
  result: InterpretationResult,
  enriched: EnrichedSuggestion[],
) {
  return {
    summary: result.summary,
    tags: result.tags,
    matchedRules: result.matchedRuleIds,
    priorities: result.priorities,
    indicators: result.indicators,
    suggestions: enriched.map((s) => ({
      kind: s.kind,
      code: s.code,
      title: s.title,
      description: s.description,
      explanation: s.explanation,
      estimatedMinutes: s.estimatedMinutes,
    })),
    sevenDayPlan: result.sevenDayPlan,
    disclaimer:
      'These are project-developed wellness reflection results. They are not a diagnosis and do not measure overall mental health.',
  };
}
