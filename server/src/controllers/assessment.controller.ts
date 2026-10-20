import type { RequestHandler } from 'express';
import mongoose from 'mongoose';
import { Assessment, AssessmentResponse, toUserPublicDto } from '../models/index.js';
import { requireUser } from '../middleware/auth.js';
import { HttpError } from '../middleware/error.js';
import { ok, created } from '../utils/http.js';
import { paginate, paginationQuerySchema, skipFor } from '../utils/pagination.js';
import {
  interpretAssessment,
  AssessmentValidationError,
  type AssessmentDef,
} from '../services/assessmentEngine.service.js';
import {
  buildResultDto,
  enrichSuggestions,
  persistAssessmentRecommendations,
} from '../services/actionPlan.service.js';
import { getContentItem } from '../data/wellnessContent.js';

type SubmitBody = {
  answers: {
    questionId: string;
    optionIds?: string[];
    value?: number;
    text?: string;
  }[];
  priorities: string[];
};

function questionDef(q: any) {
  return {
    id: q.id,
    text: q.text,
    responseType: q.responseType,
    required: q.required ?? true,
    maxSelections: q.maxSelections ?? null,
    ratingMin: q.ratingMin ?? null,
    ratingMax: q.ratingMax ?? null,
    ratingLabels: q.ratingLabels ?? null,
    maxLength: q.maxLength ?? null,
    options: (q.options ?? []).map((o: any) => ({
      id: o.id,
      label: o.label,
      tags: o.tags ?? [],
      weight: o.weight ?? 1,
    })),
    ageVariants: q.ageVariants ?? undefined,
    conditional: q.conditional ?? null,
    default: q.default,
    ratingRules: (q.ratingRules ?? []).map((r: any) => ({
      min: r.min,
      max: r.max,
      tags: r.tags ?? [],
      weight: r.weight ?? 1,
    })),
  };
}

function toAssessmentDef(assessment: any): AssessmentDef {
  return {
    code: assessment.code,
    version: assessment.version,
    title: assessment.title,
    questions: assessment.questions.map(questionDef),
    interpretationRules: (assessment.interpretationRules ?? []).map((r: any) => ({
      id: r.id,
      label: r.label,
      allTags: r.allTags ?? [],
      anyTags: r.anyTags ?? [],
      minWeight: r.minWeight ?? 0,
      priority: r.priority ?? 100,
      summary: r.summary,
      priorities: r.priorities ?? [],
      recommend: {
        games: r.recommend?.games ?? [],
        habits: r.recommend?.habits ?? [],
        journalPrompts: r.recommend?.journalPrompts ?? [],
        activities: r.recommend?.activities ?? [],
        reflections: r.recommend?.reflections ?? [],
      },
      planTemplate: r.planTemplate ?? null,
    })),
  };
}

/** Applies age-appropriate wording variants for the requesting user. */
function adaptQuestionsForAge(questions: any[], ageGroup: string) {
  return questions.map((q) => {
    const variant = q.ageVariants?.[ageGroup];
    if (!variant) return q;
    return {
      ...q,
      text: variant.text ?? q.text,
      helpText: variant.helpText ?? q.helpText,
      options: variant.options ?? q.options,
      // Age variants keep the same option ids so interpretation stays valid.
    };
  });
}

export const listAssessmentsHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const all = await Assessment.find({ status: 'published' }).sort({ category: 1, title: 1 });
    const items = all
      .filter((a) => a.ageGroups.includes(user.ageGroup))
      .map((a) => ({
        code: a.code,
        title: a.title,
        description: a.description,
        category: a.category,
        estimatedMinutes: a.estimatedMinutes,
        questionCount: a.questions.length,
        disclaimer: a.disclaimer,
        version: a.version,
      }));
    ok(res, { assessments: items });
  } catch (error) {
    next(error);
  }
};

export const getAssessmentHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const assessment = await Assessment.findOne({ code: req.params.code, status: 'published' });
    if (!assessment) throw new HttpError(404, 'Assessment not found', 'not_found');
    if (!assessment.ageGroups.includes(user.ageGroup)) {
      throw new HttpError(403, 'This assessment is not available for your age group', 'age_restricted');
    }
    const adapted = adaptQuestionsForAge(assessment.questions, user.ageGroup);
    ok(res, {
      assessment: {
        code: assessment.code,
        version: assessment.version,
        title: assessment.title,
        description: assessment.description,
        intro: assessment.intro,
        outro: assessment.outro,
        disclaimer: assessment.disclaimer,
        estimatedMinutes: assessment.estimatedMinutes,
        questions: adapted.map((q) => ({
          id: q.id,
          text: q.text,
          helpText: q.helpText,
          responseType: q.responseType,
          required: q.required,
          maxSelections: q.maxSelections,
          ratingMin: q.ratingMin,
          ratingMax: q.ratingMax,
          ratingLabels: q.ratingLabels,
          maxLength: q.maxLength,
          options: (q.options ?? []).map((o: any) => ({
            id: o.id,
            label: o.label,
            emoji: o.emoji,
          })),
          conditional: q.conditional,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const submitAssessmentHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const body = req.body as SubmitBody;

    const assessment = await Assessment.findOne({ code: req.params.code, status: 'published' });
    if (!assessment) throw new HttpError(404, 'Assessment not found', 'not_found');
    if (!assessment.ageGroups.includes(user.ageGroup)) {
      throw new HttpError(403, 'This assessment is not available for your age group', 'age_restricted');
    }

    const def = toAssessmentDef(assessment);

    let interpretation;
    try {
      interpretation = interpretAssessment(def, body.answers, user.displayName);
    } catch (error) {
      if (error instanceof AssessmentValidationError) {
        throw new HttpError(400, 'Some answers need attention', 'assessment_validation', error.issues);
      }
      throw error;
    }

    const enriched = enrichSuggestions(interpretation.suggestions, user);
    await persistAssessmentRecommendations(user, assessment.code, enriched);

    const response = await AssessmentResponse.create({
      userId: user.id,
      assessmentCode: assessment.code,
      assessmentVersion: assessment.version,
      answers: body.answers,
      tags: interpretation.tags,
      tagWeights: interpretation.tagWeights,
      matchedRules: interpretation.matchedRuleIds,
      priorities: body.priorities.length ? body.priorities : interpretation.priorities,
      summary: interpretation.summary,
      indicators: interpretation.indicators,
      suggestions: enriched.map((s) => ({
        kind: s.kind,
        code: s.code,
        title: s.title,
        explanation: s.explanation,
      })),
      sevenDayPlan: interpretation.sevenDayPlan,
      completedAt: new Date(),
    });

    created(res, {
      result: {
        id: response.id,
        assessmentCode: assessment.code,
        completedAt: response.completedAt.toISOString(),
        ...buildResultDto(interpretation, enriched),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listResponsesHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const query = paginationQuerySchema.parse(req.query);
    const filter: Record<string, unknown> = { userId: user.id };
    if (typeof req.query.assessmentCode === 'string') {
      filter.assessmentCode = req.query.assessmentCode;
    }
    const [items, total] = await Promise.all([
      AssessmentResponse.find(filter)
        .sort({ completedAt: -1 })
        .skip(skipFor(query))
        .limit(query.limit)
        .select(
          'assessmentCode assessmentVersion summary priorities indicators completedAt suggestions sevenDayPlan',
        ),
      AssessmentResponse.countDocuments(filter),
    ]);
    ok(
      res,
      paginate(
        items.map((r) => ({
          id: r.id,
          assessmentCode: r.assessmentCode,
          assessmentVersion: r.assessmentVersion,
          summary: r.summary,
          priorities: r.priorities,
          indicators: r.indicators,
          completedAt: r.completedAt.toISOString(),
          suggestionCount: r.suggestions.length,
          hasPlan: r.sevenDayPlan.length > 0,
        })),
        total,
        query,
      ),
    );
  } catch (error) {
    next(error);
  }
};

export const getResponseHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new HttpError(400, 'Invalid result id', 'invalid_id');
    }
    const response = await AssessmentResponse.findOne({ _id: id, userId: user.id });
    if (!response) throw new HttpError(404, 'Result not found', 'not_found');

    const suggestions = response.suggestions.map((s) => {
      const item = s.code ? getContentItem(s.code) : undefined;
      return {
        kind: s.kind,
        code: s.code,
        title: item?.title ?? s.title,
        description: item?.description ?? '',
        explanation: s.explanation,
        estimatedMinutes: item?.estimatedMinutes ?? 5,
      };
    });

    ok(res, {
      result: {
        id: response.id,
        assessmentCode: response.assessmentCode,
        completedAt: response.completedAt.toISOString(),
        summary: response.summary,
        tags: response.tags,
        matchedRules: response.matchedRules,
        priorities: response.priorities,
        indicators: response.indicators,
        suggestions,
        sevenDayPlan: response.sevenDayPlan,
        disclaimer:
          'These are project-developed wellness reflection results. They are not a diagnosis and do not measure overall mental health.',
      },
      user: toUserPublicDto(user),
    });
  } catch (error) {
    next(error);
  }
};
