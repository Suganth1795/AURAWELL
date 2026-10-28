export type AssessmentCategory =
  | 'emotional'
  | 'sleep'
  | 'focus'
  | 'habits'
  | 'activity'
  | 'social'
  | 'digital'
  | 'strengths'
  | 'lifestyle'
  | 'reflection'
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

export type ResponseType = 'single_choice' | 'multi_choice' | 'rating' | 'boolean' | 'short_text';

export interface AssessmentSummary {
  code: string;
  title: string;
  description: string;
  category: AssessmentCategory;
  estimatedMinutes: number;
  questionCount: number;
  disclaimer: string;
  version: string;
}

export interface AssessmentOption {
  id: string;
  label: string;
  emoji?: string;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  helpText?: string;
  responseType: ResponseType;
  required: boolean;
  maxSelections?: number | null;
  ratingMin?: number | null;
  ratingMax?: number | null;
  ratingLabels?: string[] | null;
  maxLength?: number | null;
  options: AssessmentOption[];
  conditional?: { dependsOnQuestionId: string; showWhenOptionIds: string[] } | null;
  modes?: AssessmentMode[];
  category?: AssessmentCategory;
  soundscapeRecommendation?: string;
}

export interface AssessmentDetail {
  code: string;
  version: string;
  title: string;
  description: string;
  intro: string;
  outro?: string;
  disclaimer: string;
  estimatedMinutes: number;
  mode?: AssessmentMode;
  totalQuestions?: number;
  questions: AssessmentQuestion[];
}

export interface AssessmentAnswer {
  questionId: string;
  optionIds?: string[];
  value?: number;
  text?: string;
}

export interface ResultSuggestion {
  kind: 'game' | 'habit' | 'journal_prompt' | 'sleep_routine' | 'activity' | 'reflection' | 'breathing' | 'soundscape';
  code: string;
  title: string;
  description: string;
  explanation: string;
  estimatedMinutes: number;
}

export interface CategoryStatMeta {
  id: AssessmentCategory;
  title: string;
  description: string;
  targetCount: number;
  actualCount: number;
  themeColor: string;
  iconName: string;
  defaultMinutes: {
    quick: number;
    standard: number;
    detailed: number;
  };
}

export interface AssessmentStatsSummary {
  totalQuestions: number;
  categoriesCount: number;
  categories: CategoryStatMeta[];
  modes: AssessmentMode[];
}

export interface PlanDay {
  day: number;
  focus: string;
  actions: string[];
}

export interface AssessmentResult {
  id: string;
  assessmentCode: string;
  completedAt: string;
  summary: string;
  tags?: string[];
  matchedRules?: string[];
  priorities: string[];
  indicators: Record<string, number>;
  suggestions: ResultSuggestion[];
  sevenDayPlan: PlanDay[];
  disclaimer: string;
}

export interface AssessmentHistoryItem {
  id: string;
  assessmentCode: string;
  assessmentVersion: string;
  summary: string;
  priorities: string[];
  indicators: Record<string, number>;
  completedAt: string;
  suggestionCount: number;
  hasPlan: boolean;
}
