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
  | 'reflection';

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
  questions: AssessmentQuestion[];
}

export interface AssessmentAnswer {
  questionId: string;
  optionIds?: string[];
  value?: number;
  text?: string;
}

export interface ResultSuggestion {
  kind: 'game' | 'habit' | 'journal_prompt' | 'sleep_routine' | 'activity' | 'reflection' | 'breathing';
  code: string;
  title: string;
  description: string;
  explanation: string;
  estimatedMinutes: number;
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
