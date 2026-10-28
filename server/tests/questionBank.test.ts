import { describe, expect, it } from 'vitest';
import {
  ALL_BANK_QUESTIONS,
  CATEGORY_METADATA,
  getBankQuestionsByCategory,
  getBankQuestionsByMode,
  getBankQuestionById,
  validateQuestionBank,
  type BankCategory,
} from '../src/data/questionBank/index.js';

describe('Question Bank Integrity & Breadth', () => {
  it('contains at least 530 distinct questions (540 planned)', () => {
    expect(ALL_BANK_QUESTIONS.length).toBeGreaterThanOrEqual(530);
    expect(ALL_BANK_QUESTIONS.length).toBe(540);
  });

  it('passes internal validation with zero errors or duplicates', () => {
    const report = validateQuestionBank();
    expect(report.valid).toBe(true);
    expect(report.issues).toEqual([]);
    expect(report.total).toBe(540);
  });

  it('guarantees unique IDs across every single question in the bank', () => {
    const ids = ALL_BANK_QUESTIONS.map((q) => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  const categories: [BankCategory, number][] = [
    ['daily-mood', 50],
    ['stress-pressure', 45],
    ['anxiety-worry', 45],
    ['sleep-rest', 35],
    ['emotional-wellbeing', 40],
    ['self-esteem', 35],
    ['burnout-exhaustion', 35],
    ['focus-concentration', 30],
    ['social-connection', 30],
    ['motivation-productivity', 30],
    ['anger-frustration', 25],
    ['resilience-coping', 35],
    ['gratitude-positive', 25],
    ['lifestyle-digital', 30],
    ['weekly-review', 35],
  ];

  it.each(categories)(
    'category "%s" has at least %i questions',
    (category, expectedMin) => {
      const questions = getBankQuestionsByCategory(category);
      expect(questions.length).toBeGreaterThanOrEqual(expectedMin);
      expect(CATEGORY_METADATA[category]).toBeDefined();
      expect(CATEGORY_METADATA[category].targetCount).toBe(expectedMin);
    },
  );

  it('ensures every question is thoughtfully structured with valid response types', () => {
    const validResponseTypes = new Set(['rating', 'single_choice', 'multi_choice', 'boolean', 'short_text']);

    for (const q of ALL_BANK_QUESTIONS) {
      expect(validResponseTypes.has(q.responseType)).toBe(true);
      expect(q.text.trim().length).toBeGreaterThan(10);
      expect(q.modes.length).toBeGreaterThan(0);

      if (q.responseType === 'rating') {
        expect(q.ratingMin).toBeDefined();
        expect(q.ratingMax).toBeDefined();
        expect(q.ratingMax).toBeGreaterThan(q.ratingMin!);
        expect(q.ratingLabels).toBeDefined();
        expect(q.ratingLabels!.length).toBeGreaterThanOrEqual(3);
        expect(q.ratingRules).toBeDefined();
        expect(q.ratingRules!.length).toBeGreaterThan(0);
      } else if (q.responseType === 'single_choice' || q.responseType === 'multi_choice') {
        expect(q.options).toBeDefined();
        expect(q.options!.length).toBeGreaterThanOrEqual(2);
        for (const opt of q.options!) {
          expect(opt.id).toBeTruthy();
          expect(opt.label).toBeTruthy();
          expect(Array.isArray(opt.tags)).toBe(true);
        }
      } else if (q.responseType === 'boolean') {
        expect(q.options).toBeDefined();
        expect(q.options!.length).toBe(2);
      } else if (q.responseType === 'short_text') {
        expect(q.maxLength).toBeDefined();
        expect(q.maxLength).toBeGreaterThan(20);
      }
    }
  });

  it('filters questions accurately by assessment mode', () => {
    const quick = getBankQuestionsByMode('stress-pressure', 'quick');
    const standard = getBankQuestionsByMode('stress-pressure', 'standard');
    const detailed = getBankQuestionsByMode('stress-pressure', 'detailed');

    expect(quick.length).toBeGreaterThanOrEqual(4);
    expect(standard.length).toBeGreaterThanOrEqual(quick.length);
    expect(detailed.length).toBe(45);
  });

  it('retrieves questions by stable ID', () => {
    const mood1 = getBankQuestionById('mood-001');
    expect(mood1).toBeDefined();
    expect(mood1?.category).toBe('daily-mood');
    expect(mood1?.text).toContain('emotional weather');

    const sleep1 = getBankQuestionById('sleep-001');
    expect(sleep1).toBeDefined();
    expect(sleep1?.category).toBe('sleep-rest');
  });
});
