import type { AgeGroup } from '../utils/ageGroup.js';

export interface QuestionDef {
  id: string;
  text: string;
  responseType: 'single_choice' | 'multi_choice' | 'rating' | 'boolean' | 'short_text';
  required: boolean;
  maxSelections?: number | null;
  ratingMin?: number | null;
  ratingMax?: number | null;
  ratingLabels?: string[] | null;
  maxLength?: number | null;
  options: { id: string; label: string; tags: string[]; weight: number }[];
  ageVariants?: Record<string, { text?: string; options?: { id: string; label: string; tags: string[]; weight: number }[] }>;
  conditional?: { dependsOnQuestionId: string; showWhenOptionIds: string[] } | null;
  ratingRules?: { min?: number; max?: number; tags: string[]; weight: number }[];
  default?: string | number | string[] | boolean;
}

export interface InterpretationRuleDef {
  id: string;
  label: string;
  allTags: string[];
  anyTags: string[];
  minWeight: number;
  priority: number;
  summary: string;
  priorities: string[];
  recommend: {
    games: string[];
    habits: string[];
    journalPrompts: string[];
    activities: string[];
    reflections: string[];
  };
  planTemplate?: { days: { day: number; focus: string; actions: string[] }[] } | null;
}

export interface AssessmentDef {
  code: string;
  version: string;
  title: string;
  questions: QuestionDef[];
  interpretationRules: InterpretationRuleDef[];
}

export interface AnswerInput {
  questionId: string;
  optionIds?: string[];
  value?: number;
  text?: string;
}

export interface Suggestion {
  kind: 'game' | 'habit' | 'journal_prompt' | 'sleep_routine' | 'activity' | 'reflection' | 'breathing';
  code: string;
  title: string;
  explanation: string;
}

export interface PlanDay {
  day: number;
  focus: string;
  actions: string[];
}

export interface InterpretationResult {
  tags: string[];
  tagWeights: Record<string, number>;
  matchedRuleIds: string[];
  matchedSummaries: string[];
  priorities: string[];
  suggestions: Suggestion[];
  sevenDayPlan: PlanDay[];
  indicators: Record<string, number>;
  summary: string;
}

export const STRAIN_TAG_PREFIXES = [
  'emotions:low',
  'calm:stressed',
  'sleep:short',
  'sleep:inconsistent',
  'sleep:unrested',
  'sleep:screens',
  'sleep:busy',
  'sleep:marginal',
  'sleep:long',
  'focus:distracted',
  'focus:low_confidence',
  'focus:medium_confidence',
  'barrier:time',
  'barrier:forget',
  'barrier:energy',
  'barrier:motivation',
  'barrier:unclear',
  'movement:low',
  'movement:mood_down',
  'movement:mood_neutral',
  'social:isolated',
  'social:no_support',
  'social:drained',
  'social:wants',
  'social:somewhat',
  'digital:drained',
  'digital:wired',
  'digital:guilty',
  'digital:distracted',
  'digital:heavy',
  'digital:some',
  'balance:overloaded',
  'balance:poor_recovery',
  'balance:partial_recovery',
  'balance:stretch',
  'week:tough',
  'week:mixed',
  'week:no_habit',
  'strength:exploring',
  'coping:unsure',
  'pref:unsure',
];

export class AssessmentValidationError extends Error {
  readonly issues: { questionId: string; message: string }[];
  constructor(issues: { questionId: string; message: string }[]) {
    super('Assessment answers failed validation');
    this.name = 'AssessmentValidationError';
    this.issues = issues;
  }
}

/** Returns true when a question should be shown given earlier answers. */
export function isQuestionVisible(
  question: QuestionDef,
  answersByQuestion: Map<string, AnswerInput>,
): boolean {
  if (!question.conditional) return true;
  const dep = answersByQuestion.get(question.conditional.dependsOnQuestionId);
  if (!dep?.optionIds?.length) return false;
  return dep.optionIds.some((id) => question.conditional!.showWhenOptionIds.includes(id));
}

export function validateAnswers(
  questions: QuestionDef[],
  answers: AnswerInput[],
): { answersByQuestion: Map<string, AnswerInput>; visible: QuestionDef[] } {
  const knownIds = new Set(questions.map((q) => q.id));
  const issues: { questionId: string; message: string }[] = [];

  const answersByQuestion = new Map<string, AnswerInput>();
  for (const answer of answers) {
    if (!knownIds.has(answer.questionId)) {
      issues.push({ questionId: answer.questionId, message: 'Unknown question' });
      continue;
    }
    if (answersByQuestion.has(answer.questionId)) {
      issues.push({ questionId: answer.questionId, message: 'Duplicate answer' });
      continue;
    }
    const question = questions.find((q) => q.id === answer.questionId)!;
    if (isQuestionVisible(question, answersByQuestion)) {
      answersByQuestion.set(answer.questionId, answer);
    }
  }

  const visible = questions.filter((q) => isQuestionVisible(q, answersByQuestion));

  for (const question of visible) {
    const answer = answersByQuestion.get(question.id);
    if (!answer) {
      if (question.required !== false) {
        issues.push({ questionId: question.id, message: 'This question is required' });
      } else if (question.default !== undefined) {
        // Optional questions may be omitted when a safe default exists.
        const fallback: AnswerInput = { questionId: question.id };
        if (typeof question.default === 'string') fallback.text = question.default;
        else if (typeof question.default === 'number') fallback.value = question.default;
        else if (Array.isArray(question.default)) fallback.optionIds = [...question.default];
        else fallback.optionIds = question.default ? ['yes'] : ['no'];
        answersByQuestion.set(question.id, fallback);
      }
      continue;
    }

    if (question.responseType === 'single_choice' || question.responseType === 'boolean') {
      const ids = answer.optionIds ?? [];
      if (ids.length !== 1 || !question.options.some((o) => o.id === ids[0])) {
        issues.push({ questionId: question.id, message: 'Choose one valid option' });
      }
    } else if (question.responseType === 'multi_choice') {
      const ids = answer.optionIds ?? [];
      if (question.required && ids.length === 0) {
        issues.push({ questionId: question.id, message: 'Choose at least one option' });
      }
      const validIds = new Set(question.options.map((o) => o.id));
      if (ids.some((id) => !validIds.has(id))) {
        issues.push({ questionId: question.id, message: 'Invalid option provided' });
      }
      if (question.maxSelections && ids.length > question.maxSelections) {
        issues.push({
          questionId: question.id,
          message: `Choose at most ${question.maxSelections} options`,
        });
      }
    } else if (question.responseType === 'rating') {
      const value = answer.value;
      const min = question.ratingMin ?? 1;
      const max = question.ratingMax ?? 5;
      if (value === undefined || !Number.isFinite(value) || value < min || value > max) {
        issues.push({ questionId: question.id, message: `Choose a value between ${min} and ${max}` });
      }
    } else if (question.responseType === 'short_text') {
      const text = answer.text ?? '';
      if (question.required && text.trim().length === 0) {
        issues.push({ questionId: question.id, message: 'Please write a short answer' });
      }
      if (text.length > (question.maxLength ?? 500)) {
        issues.push({
          questionId: question.id,
          message: `Answer must be at most ${question.maxLength ?? 500} characters`,
        });
      }
    }
  }

  if (issues.length > 0) throw new AssessmentValidationError(issues);
  return { answersByQuestion, visible };
}

const STRAIN_SET = new Set(STRAIN_TAG_PREFIXES);

function domainOf(tag: string): string {
  return tag.split(':')[0];
}

/**
 * Deterministic interpretation: transparent tag weights, rule matching and
 * domain "wellness indicators" (0-100, self-report based, non-diagnostic).
 */
export function interpretAssessment(
  assessment: AssessmentDef,
  answers: AnswerInput[],
  displayName: string,
): InterpretationResult {
  const { answersByQuestion, visible } = validateAnswers(assessment.questions, answers);

  const tagWeights: Record<string, number> = {};

  function addTags(tags: string[], weight: number) {
    for (const tag of tags) {
      tagWeights[tag] = (tagWeights[tag] ?? 0) + weight;
    }
  }

  for (const question of visible) {
    const answer = answersByQuestion.get(question.id);
    if (!answer) continue;

    if (question.responseType === 'single_choice' || question.responseType === 'boolean') {
      const chosen = question.options.find((o) => o.id === answer.optionIds?.[0]);
      if (chosen) addTags(chosen.tags, chosen.weight ?? 1);
    } else if (question.responseType === 'multi_choice') {
      for (const id of answer.optionIds ?? []) {
        const chosen = question.options.find((o) => o.id === id);
        if (chosen) addTags(chosen.tags, chosen.weight ?? 1);
      }
    } else if (question.responseType === 'rating') {
      const value = answer.value ?? 0;
      for (const rule of question.ratingRules ?? []) {
        const minOk = rule.min === undefined || value >= rule.min;
        const maxOk = rule.max === undefined || value <= rule.max;
        if (minOk && maxOk) addTags(rule.tags, rule.weight ?? 1);
      }
    }
  }

  const tags = Object.keys(tagWeights);

  const matched = assessment.interpretationRules
    .filter((rule) => {
      const has = (tag: string) => tag in tagWeights;
      const allTags = (rule.allTags ?? []).filter(has);
      if (allTags.length !== (rule.allTags ?? []).length) return false;
      const anyTags = (rule.anyTags ?? []).filter(has);
      const anyOk = (rule.anyTags ?? []).length === 0 || anyTags.length > 0;
      if (!anyOk) return false;
      const weightSum = [...allTags, ...anyTags].reduce(
        (sum, tag) => sum + (tagWeights[tag] ?? 0),
        0,
      );
      return weightSum >= (rule.minWeight ?? 0);
    })
    .sort((a, b) => a.priority - b.priority);

  // Domain wellness indicators: only domains this assessment actually probes
  // are reported, so an emotional check-in never claims to measure sleep.
  const probedDomains = new Set<string>();
  const collectProbed = (tags: string[] | undefined) => {
    for (const tag of tags ?? []) {
      if (STRAIN_SET.has(tag)) probedDomains.add(domainOf(tag));
    }
  };
  for (const question of visible) {
    for (const option of question.options ?? []) collectProbed(option.tags);
    for (const rule of question.ratingRules ?? []) collectProbed(rule.tags);
  }

  const domainPenalties: Record<string, number> = {};
  for (const domain of probedDomains) domainPenalties[domain] = 0;
  for (const [tag, weight] of Object.entries(tagWeights)) {
    if (STRAIN_SET.has(tag)) {
      const domain = domainOf(tag);
      if (domain in domainPenalties) domainPenalties[domain] += weight;
    }
  }
  const indicators: Record<string, number> = {};
  for (const [domain, penalty] of Object.entries(domainPenalties)) {
    indicators[domain] = Math.max(5, Math.min(100, Math.round(100 - penalty * 18)));
  }

  const suggestions: Suggestion[] = [];
  const seenCodes = new Set<string>();
  function pushSuggestion(kind: Suggestion['kind'], code: string, explanation: string) {
    const key = `${kind}:${code}`;
    if (seenCodes.has(key)) return;
    seenCodes.add(key);
    suggestions.push({ kind, code, title: code, explanation });
  }

  const priorities: string[] = [];
  for (const rule of matched.slice(0, 3)) {
    for (const p of rule.priorities) {
      if (!priorities.includes(p)) priorities.push(p);
    }
    for (const code of rule.recommend.games ?? []) {
      pushSuggestion('game', code, `Suggested by “${rule.label}” in ${assessment.title}.`);
    }
    for (const code of rule.recommend.habits ?? []) {
      pushSuggestion('habit', code, `Suggested by “${rule.label}” in ${assessment.title}.`);
    }
    for (const code of rule.recommend.journalPrompts ?? []) {
      pushSuggestion('journal_prompt', code, `Suggested by “${rule.label}” in ${assessment.title}.`);
    }
    for (const code of rule.recommend.activities ?? []) {
      pushSuggestion('activity', code, `Suggested by “${rule.label}” in ${assessment.title}.`);
    }
    for (const code of rule.recommend.reflections ?? []) {
      pushSuggestion('reflection', code, `Suggested by “${rule.label}” in ${assessment.title}.`);
    }
  }

  let sevenDayPlan: PlanDay[] = [];
  const planRule = matched.find((r) => r.planTemplate?.days?.length);
  if (planRule?.planTemplate) {
    sevenDayPlan = planRule.planTemplate.days.map((d) => ({ ...d }));
  }

  const summaries = matched.slice(0, 2).map((r) => r.summary);
  const positiveTags = tags.filter((t) => !STRAIN_SET.has(t)).slice(0, 4);
  const summaryParts = [
    `${displayName}, thank you for completing “${assessment.title}”.`,
    ...summaries,
    positiveTags.length
      ? `You also reported strengths such as ${positiveTags.map((t) => t.split(':')[1].replace(/_/g, ' ')).join(', ')}.`
      : '',
  ].filter(Boolean);

  return {
    tags,
    tagWeights,
    matchedRuleIds: matched.map((r) => r.id),
    matchedSummaries: summaries,
    priorities,
    suggestions,
    sevenDayPlan,
    indicators,
    summary: summaryParts.join(' '),
  };
}

export function ageGroupEligible(assessmentAgeGroups: AgeGroup[], ageGroup: AgeGroup): boolean {
  return assessmentAgeGroups.includes(ageGroup);
}
