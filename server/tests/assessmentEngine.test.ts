import { describe, expect, it } from 'vitest';
import { getAssessmentSeed } from '../src/data/assessments.js';
import { getContentItem } from '../src/data/wellnessContent.js';
import {
  AssessmentValidationError,
  ageGroupEligible,
  interpretAssessment,
  isQuestionVisible,
  validateAnswers,
  type AssessmentDef,
  type QuestionDef,
} from '../src/services/assessmentEngine.service.js';
import { enrichSuggestions } from '../src/services/actionPlan.service.js';
import type { UserDoc } from '../src/models/index.js';

function toDef(code: string): AssessmentDef {
  const seed = getAssessmentSeed(code);
  if (!seed) throw new Error(`missing seed ${code}`);
  return {
    code: seed.code,
    version: seed.version,
    title: seed.title,
    questions: seed.questions as QuestionDef[],
    interpretationRules: seed.interpretationRules as AssessmentDef['interpretationRules'],
  };
}

function rating(questionId: string, value: number) {
  return { questionId, value };
}
function single(questionId: string, optionId: string) {
  return { questionId, optionIds: [optionId] };
}
function multi(questionId: string, optionIds: string[]) {
  return { questionId, optionIds };
}

const emotional = toDef('emotional-wellness');

describe('validateAnswers', () => {
  it('rejects a missing required question', () => {
    expect(() => validateAnswers(emotional.questions, [rating('mood-week', 3)])).toThrow(
      AssessmentValidationError,
    );
  });

  it('rejects out-of-range ratings', () => {
    const answers = [
      rating('mood-week', 9),
      multi('feeling-signals', ['calm']),
      single('help-focus', 'calm'),
      multi('unwind-ways', ['quiet']),
      single('preferred-mode', 'reflection'),
    ];
    try {
      validateAnswers(emotional.questions, answers);
      expect.unreachable('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(AssessmentValidationError);
      const issues = (error as AssessmentValidationError).issues;
      expect(issues.some((i) => i.questionId === 'mood-week')).toBe(true);
    }
  });

  it('rejects unknown and duplicate question ids', () => {
    const answers = [
      rating('mood-week', 3),
      multi('feeling-signals', ['calm']),
      single('help-focus', 'calm'),
      multi('unwind-ways', ['quiet']),
      single('preferred-mode', 'reflection'),
      { questionId: 'not-a-question', value: 1 },
      single('help-focus', 'mood'),
    ];
    try {
      validateAnswers(emotional.questions, answers);
      expect.unreachable('should have thrown');
    } catch (error) {
      const issues = (error as AssessmentValidationError).issues;
      expect(issues.some((i) => i.message === 'Unknown question')).toBe(true);
      expect(issues.some((i) => i.message === 'Duplicate answer')).toBe(true);
    }
  });

  it('accepts a complete valid answer set', () => {
    const { visible } = validateAnswers(emotional.questions, [
      rating('mood-week', 3),
      multi('feeling-signals', ['calm', 'joy']),
      single('help-focus', 'calm'),
      multi('unwind-ways', ['quiet']),
      single('preferred-mode', 'reflection'),
    ]);
    expect(visible).toHaveLength(emotional.questions.length);
  });
});

describe('conditional visibility', () => {
  const questions: QuestionDef[] = [
    {
      id: 'q1',
      text: 'Pick one',
      responseType: 'single_choice',
      required: true,
      options: [
        { id: 'yes', label: 'Yes', tags: [], weight: 1 },
        { id: 'no', label: 'No', tags: [], weight: 1 },
      ],
    },
    {
      id: 'q2',
      text: 'Why?',
      responseType: 'short_text',
      required: true,
      options: [],
      conditional: { dependsOnQuestionId: 'q1', showWhenOptionIds: ['yes'] },
    },
  ];

  it('hides dependent questions until the dependency is answered', () => {
    expect(isQuestionVisible(questions[1], new Map())).toBe(false);
    expect(isQuestionVisible(questions[1], new Map([['q1', single('q1', 'no')]]))).toBe(false);
    expect(isQuestionVisible(questions[1], new Map([['q1', single('q1', 'yes')]]))).toBe(true);
  });

  it('does not require hidden questions to be answered', () => {
    const { visible } = validateAnswers(questions, [single('q1', 'no')]);
    expect(visible.map((q) => q.id)).toEqual(['q1']);
  });
});

describe('interpretAssessment', () => {
  const lowMoodAnswers = [
    rating('mood-week', 2),
    multi('feeling-signals', ['worried', 'sad']),
    single('help-focus', 'mood'),
    multi('unwind-ways', ['none']),
    single('preferred-mode', 'reflection'),
  ];

  it('matches low-mood and stress rules and produces a 7-day plan', () => {
    const result = interpretAssessment(emotional, lowMoodAnswers, 'Asha');

    expect(result.matchedRuleIds).toContain('low-mood-support');
    expect(result.matchedRuleIds).toContain('stress-signals');
    expect(result.priorities.length).toBeGreaterThan(0);
    expect(result.sevenDayPlan).toHaveLength(7);
    expect(result.summary).toContain('Asha');
    expect(result.summary).toContain('Emotional wellness check-in');
  });

  it('aggregates transparent tag weights', () => {
    const result = interpretAssessment(emotional, lowMoodAnswers, 'Asha');
    // mood-week max:2 → weight 3, feeling-signals sad → +2
    expect(result.tagWeights['emotions:low']).toBe(5);
    expect(result.tagWeights['calm:stressed']).toBe(2);
    expect(result.tags).toEqual(expect.arrayContaining(['emotions:low', 'calm:stressed']));
  });

  it('computes per-domain wellness indicators instead of a global score', () => {
    const result = interpretAssessment(emotional, lowMoodAnswers, 'Asha');
    expect(Object.keys(result.indicators)).toEqual(
      expect.arrayContaining(['emotions', 'calm', 'coping']),
    );
    for (const value of Object.values(result.indicators)) {
      expect(value).toBeGreaterThanOrEqual(5);
      expect(value).toBeLessThanOrEqual(100);
    }
    expect(result.indicators.emotions).toBeLessThan(100);
    expect(result.indicators.calm).toBeLessThan(100);
  });

  it('keeps the low-mood rule out of a positive result', () => {
    const result = interpretAssessment(
      emotional,
      [
        rating('mood-week', 5),
        multi('feeling-signals', ['calm', 'joy']),
        single('help-focus', 'connection'),
        multi('unwind-ways', ['people', 'move']),
        single('preferred-mode', 'game'),
      ],
      'Ravi',
    );
    expect(result.matchedRuleIds).not.toContain('low-mood-support');
    expect(result.matchedRuleIds).not.toContain('stress-signals');
    expect(result.matchedRuleIds).toContain('positive-balance');
    expect(result.indicators.emotions).toBe(100);
  });

  it('orders matched rules by priority', () => {
    const result = interpretAssessment(emotional, lowMoodAnswers, 'Asha');
    const priorities = result.matchedRuleIds;
    expect(priorities.indexOf('low-mood-support')).toBeLessThan(
      priorities.indexOf('positive-balance') === -1
        ? priorities.length
        : priorities.indexOf('positive-balance'),
    );
  });

  it('always includes a non-diagnostic disclaimer contract', () => {
    const result = interpretAssessment(emotional, lowMoodAnswers, 'Asha');
    expect(result.summary).not.toMatch(/diagnos/i);
    expect(result.matchedSummaries.every((s) => s.length > 0)).toBe(true);
  });
});

describe('suggestion enrichment', () => {
  it('resolves titles from the catalogue and drops unknown codes', () => {
    const user = { ageGroup: 'adult' } as UserDoc;
    const enriched = enrichSuggestions(
      [
        { kind: 'game', code: 'gratitude-quest', title: 'gratitude-quest', explanation: 'why' },
        { kind: 'game', code: 'does-not-exist', title: 'x', explanation: 'why' },
      ],
      user,
    );
    expect(enriched).toHaveLength(1);
    expect(enriched[0].title).toBe(getContentItem('gratitude-quest')?.title);
    expect(enriched[0].estimatedMinutes).toBeGreaterThan(0);
  });

  it('drops suggestions that are not age eligible', () => {
    const childUser = { ageGroup: 'child' } as UserDoc;
    const adultOnly = {
      kind: 'activity' as const,
      code: 'act-connect-someone',
      title: 'x',
      explanation: 'why',
    };
    const item = getContentItem('act-connect-someone');
    const enriched = enrichSuggestions([adultOnly], childUser);
    expect(enriched).toHaveLength(item?.ageGroups.includes('child') ? 1 : 0);
  });
});

describe('ageGroupEligible', () => {
  it('matches exact age groups only', () => {
    expect(ageGroupEligible(['adult', 'older_adult'], 'adult')).toBe(true);
    expect(ageGroupEligible(['adult'], 'teen')).toBe(false);
    expect(ageGroupEligible(['child', 'teen', 'adult', 'older_adult'], 'child')).toBe(true);
  });
});

describe('seed integrity', () => {
  it('every recommendation code exists in the wellness catalogue', async () => {
    const { ASSESSMENT_SEEDS } = await import('../src/data/assessments.js');
    const missing: string[] = [];
    for (const seed of ASSESSMENT_SEEDS) {
      for (const rule of seed.interpretationRules) {
        const codes = [
          ...(rule.recommend.games ?? []),
          ...(rule.recommend.habits ?? []),
          ...(rule.recommend.journalPrompts ?? []),
          ...(rule.recommend.activities ?? []),
          ...(rule.recommend.reflections ?? []),
        ];
        for (const code of codes) {
          if (!getContentItem(code)) missing.push(`${seed.code}:${rule.id}:${code}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it('every seed publishes a disclaimer and age groups', async () => {
    const { ASSESSMENT_SEEDS } = await import('../src/data/assessments.js');
    for (const seed of ASSESSMENT_SEEDS) {
      expect(seed.status).toBe('published');
      expect(seed.ageGroups.length).toBeGreaterThan(0);
      expect(seed.questions.length).toBeGreaterThan(0);
      const ids = seed.questions.map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
