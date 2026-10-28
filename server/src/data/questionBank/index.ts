import type { BankCategory, BankQuestion, CategoryMeta, AssessmentMode } from './types.js';
import { DAILY_MOOD_QUESTIONS } from './dailyMood.js';
import { STRESS_PRESSURE_QUESTIONS } from './stressPressure.js';
import { ANXIETY_WORRY_QUESTIONS } from './anxietyWorry.js';
import { SLEEP_REST_QUESTIONS } from './sleepRest.js';
import { EMOTIONAL_WELLBEING_QUESTIONS } from './emotionalWellbeing.js';
import { SELF_ESTEEM_CONFIDENCE_QUESTIONS } from './selfEsteemConfidence.js';
import { BURNOUT_EXHAUSTION_QUESTIONS } from './burnoutExhaustion.js';
import { FOCUS_CONCENTRATION_QUESTIONS } from './focusConcentration.js';
import { SOCIAL_CONNECTION_QUESTIONS } from './socialConnection.js';
import { MOTIVATION_PRODUCTIVITY_QUESTIONS } from './motivationProductivity.js';
import { ANGER_FRUSTRATION_QUESTIONS } from './angerFrustration.js';
import { RESILIENCE_COPING_QUESTIONS } from './resilienceCoping.js';
import { GRATITUDE_POSITIVE_QUESTIONS } from './gratitudePositive.js';
import { LIFESTYLE_DIGITAL_QUESTIONS } from './lifestyleDigital.js';
import { WEEKLY_REVIEW_QUESTIONS } from './weeklyReview.js';

export * from './types.js';
export { DAILY_MOOD_QUESTIONS } from './dailyMood.js';
export { STRESS_PRESSURE_QUESTIONS } from './stressPressure.js';
export { ANXIETY_WORRY_QUESTIONS } from './anxietyWorry.js';
export { SLEEP_REST_QUESTIONS } from './sleepRest.js';
export { EMOTIONAL_WELLBEING_QUESTIONS } from './emotionalWellbeing.js';
export { SELF_ESTEEM_CONFIDENCE_QUESTIONS } from './selfEsteemConfidence.js';
export { BURNOUT_EXHAUSTION_QUESTIONS } from './burnoutExhaustion.js';
export { FOCUS_CONCENTRATION_QUESTIONS } from './focusConcentration.js';
export { SOCIAL_CONNECTION_QUESTIONS } from './socialConnection.js';
export { MOTIVATION_PRODUCTIVITY_QUESTIONS } from './motivationProductivity.js';
export { ANGER_FRUSTRATION_QUESTIONS } from './angerFrustration.js';
export { RESILIENCE_COPING_QUESTIONS } from './resilienceCoping.js';
export { GRATITUDE_POSITIVE_QUESTIONS } from './gratitudePositive.js';
export { LIFESTYLE_DIGITAL_QUESTIONS } from './lifestyleDigital.js';
export { WEEKLY_REVIEW_QUESTIONS } from './weeklyReview.js';

export const CATEGORY_METADATA: Record<BankCategory, CategoryMeta> = {
  'daily-mood': {
    id: 'daily-mood',
    title: 'Daily Mood & Emotions',
    description: 'Track daily emotional valence, fluctuations, and inner weather.',
    targetCount: 50,
    themeColor: '#38bdf8',
    iconName: 'Sun',
    defaultMinutes: { quick: 2, standard: 5, detailed: 12 },
  },
  'stress-pressure': {
    id: 'stress-pressure',
    title: 'Stress & Pressure',
    description: 'Assess acute and chronic workload, internal urgency, and physical tension.',
    targetCount: 45,
    themeColor: '#fb7185',
    iconName: 'Activity',
    defaultMinutes: { quick: 2, standard: 5, detailed: 11 },
  },
  'anxiety-worry': {
    id: 'anxiety-worry',
    title: 'Anxiety & Worry',
    description: 'Explore racing thoughts, somatic jitters, and intolerance of uncertainty.',
    targetCount: 45,
    themeColor: '#c084fc',
    iconName: 'Wind',
    defaultMinutes: { quick: 2, standard: 5, detailed: 11 },
  },
  'sleep-rest': {
    id: 'sleep-rest',
    title: 'Sleep & Rest',
    description: 'Evaluate sleep onset, consistency, bedtime screens, and restoration.',
    targetCount: 35,
    themeColor: '#818cf8',
    iconName: 'Moon',
    defaultMinutes: { quick: 2, standard: 5, detailed: 10 },
  },
  'emotional-wellbeing': {
    id: 'emotional-wellbeing',
    title: 'Emotional Wellbeing',
    description: 'Cultivate emotional granularity, self-compassion, and inner peace.',
    targetCount: 40,
    themeColor: '#f472b6',
    iconName: 'Heart',
    defaultMinutes: { quick: 2, standard: 5, detailed: 10 },
  },
  'self-esteem': {
    id: 'self-esteem',
    title: 'Self-Esteem & Confidence',
    description: 'Measure inherent self-worth, imposter feelings, and assertive self-advocacy.',
    targetCount: 35,
    themeColor: '#fbbf24',
    iconName: 'Shield',
    defaultMinutes: { quick: 2, standard: 5, detailed: 10 },
  },
  'burnout-exhaustion': {
    id: 'burnout-exhaustion',
    title: 'Burnout & Exhaustion',
    description: 'Detect chronic depletion, cynicism, and loss of personal accomplishment.',
    targetCount: 35,
    themeColor: '#f97316',
    iconName: 'Flame',
    defaultMinutes: { quick: 2, standard: 5, detailed: 10 },
  },
  'focus-concentration': {
    id: 'focus-concentration',
    title: 'Focus & Concentration',
    description: 'Identify distraction triggers, flow state latency, and deep work habits.',
    targetCount: 30,
    themeColor: '#34d399',
    iconName: 'Target',
    defaultMinutes: { quick: 2, standard: 4, detailed: 8 },
  },
  'social-connection': {
    id: 'social-connection',
    title: 'Social Connection & Belonging',
    description: 'Reflect on relationship depth, social battery, and feeling seen by others.',
    targetCount: 30,
    themeColor: '#2dd4bf',
    iconName: 'Users',
    defaultMinutes: { quick: 2, standard: 4, detailed: 8 },
  },
  'motivation-productivity': {
    id: 'motivation-productivity',
    title: 'Motivation & Productivity',
    description: 'Overcome inertia, discover intrinsic drive, and celebrate micro-wins.',
    targetCount: 30,
    themeColor: '#a78bfa',
    iconName: 'Zap',
    defaultMinutes: { quick: 2, standard: 4, detailed: 8 },
  },
  'anger-frustration': {
    id: 'anger-frustration',
    title: 'Anger & Frustration',
    description: 'Notice somatic irritability, healthy boundary signaling, and cooling tools.',
    targetCount: 25,
    themeColor: '#ef4444',
    iconName: 'AlertCircle',
    defaultMinutes: { quick: 2, standard: 4, detailed: 7 },
  },
  'resilience-coping': {
    id: 'resilience-coping',
    title: 'Resilience & Coping',
    description: 'Strengthen adaptive flexibility, distress tolerance, and crisis toolkits.',
    targetCount: 35,
    themeColor: '#10b981',
    iconName: 'Anchor',
    defaultMinutes: { quick: 2, standard: 5, detailed: 10 },
  },
  'gratitude-positive': {
    id: 'gratitude-positive',
    title: 'Gratitude & Joy',
    description: 'Savor simple blessings, counter negativity bias, and celebrate life.',
    targetCount: 25,
    themeColor: '#eab308',
    iconName: 'Sparkles',
    defaultMinutes: { quick: 2, standard: 4, detailed: 7 },
  },
  'lifestyle-digital': {
    id: 'lifestyle-digital',
    title: 'Lifestyle & Digital Wellbeing',
    description: 'Cultivate screen boundaries, daylight exposure, movement, and hydration.',
    targetCount: 30,
    themeColor: '#06b6d4',
    iconName: 'Smartphone',
    defaultMinutes: { quick: 2, standard: 4, detailed: 8 },
  },
  'weekly-review': {
    id: 'weekly-review',
    title: 'Weekly Mental Wellness Review',
    description: 'Comprehensive 7-day retrospective, wins, obstacles, and next week intention.',
    targetCount: 35,
    themeColor: '#6366f1',
    iconName: 'Calendar',
    defaultMinutes: { quick: 3, standard: 7, detailed: 12 },
  },
};

export const ALL_BANK_QUESTIONS: BankQuestion[] = [
  ...DAILY_MOOD_QUESTIONS,
  ...STRESS_PRESSURE_QUESTIONS,
  ...ANXIETY_WORRY_QUESTIONS,
  ...SLEEP_REST_QUESTIONS,
  ...EMOTIONAL_WELLBEING_QUESTIONS,
  ...SELF_ESTEEM_CONFIDENCE_QUESTIONS,
  ...BURNOUT_EXHAUSTION_QUESTIONS,
  ...FOCUS_CONCENTRATION_QUESTIONS,
  ...SOCIAL_CONNECTION_QUESTIONS,
  ...MOTIVATION_PRODUCTIVITY_QUESTIONS,
  ...ANGER_FRUSTRATION_QUESTIONS,
  ...RESILIENCE_COPING_QUESTIONS,
  ...GRATITUDE_POSITIVE_QUESTIONS,
  ...LIFESTYLE_DIGITAL_QUESTIONS,
  ...WEEKLY_REVIEW_QUESTIONS,
];

export const BANK_QUESTIONS_BY_ID = new Map<string, BankQuestion>(
  ALL_BANK_QUESTIONS.map((q) => [q.id, q]),
);

export function getBankQuestionsByCategory(category: BankCategory): BankQuestion[] {
  return ALL_BANK_QUESTIONS.filter((q) => q.category === category);
}

export function getBankQuestionsByMode(category: BankCategory, mode: AssessmentMode): BankQuestion[] {
  const categoryQuestions = getBankQuestionsByCategory(category);
  if (mode === 'detailed') {
    return categoryQuestions;
  }
  const filtered = categoryQuestions.filter((q) => q.modes.includes(mode));
  // If quick or standard has fewer questions than expected, fallback to first N
  const minRequired = mode === 'quick' ? 4 : 8;
  if (filtered.length < minRequired) {
    return categoryQuestions.slice(0, mode === 'quick' ? 5 : 12);
  }
  return filtered;
}

export function getBankQuestionById(id: string): BankQuestion | undefined {
  return BANK_QUESTIONS_BY_ID.get(id);
}

export function getBankCategoryMetadata(category: BankCategory): CategoryMeta | undefined {
  return CATEGORY_METADATA[category];
}

export function validateQuestionBank(): { valid: boolean; total: number; issues: string[] } {
  const issues: string[] = [];
  const seenIds = new Set<string>();

  for (const q of ALL_BANK_QUESTIONS) {
    if (seenIds.has(q.id)) {
      issues.push(`Duplicate question ID found: ${q.id}`);
    }
    seenIds.add(q.id);

    if (!q.text || q.text.trim().length === 0) {
      issues.push(`Empty question text for ID: ${q.id}`);
    }
    if (!q.modes || q.modes.length === 0) {
      issues.push(`Missing modes for question ID: ${q.id}`);
    }
  }

  for (const [cat, meta] of Object.entries(CATEGORY_METADATA)) {
    const count = getBankQuestionsByCategory(cat as BankCategory).length;
    if (count < meta.targetCount) {
      issues.push(`Category ${cat} has ${count} questions, below target ${meta.targetCount}`);
    }
  }

  return {
    valid: issues.length === 0,
    total: ALL_BANK_QUESTIONS.length,
    issues,
  };
}

// Self-check on module evaluation
const validation = validateQuestionBank();
if (!validation.valid) {
  console.error('Question Bank validation errors:', validation.issues);
}
