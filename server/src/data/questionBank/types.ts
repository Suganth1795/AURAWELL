import type { SeedQuestion } from '../assessments.js';

export type BankCategory =
  | 'daily-mood'
  | 'stress-pressure'
  | 'anxiety-worry'
  | 'sleep-rest'
  | 'emotional-wellbeing'
  | 'self-esteem'
  | 'burnout-exhaustion'
  | 'focus-concentration'
  | 'social-connection'
  | 'motivation-productivity'
  | 'anger-frustration'
  | 'resilience-coping'
  | 'gratitude-positive'
  | 'lifestyle-digital'
  | 'weekly-review';

export type AssessmentMode = 'quick' | 'standard' | 'detailed' | 'daily' | 'weekly';

export interface BankQuestion extends SeedQuestion {
  id: string;
  category: BankCategory;
  modes: AssessmentMode[];
  soundscapeRecommendation?: string;
}

export interface CategoryMeta {
  id: BankCategory;
  title: string;
  description: string;
  targetCount: number;
  themeColor: string;
  iconName: string;
  defaultMinutes: {
    quick: number;
    standard: number;
    detailed: number;
  };
}
