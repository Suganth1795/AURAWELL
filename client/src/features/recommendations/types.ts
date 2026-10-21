export type RecommendationKind =
  | 'game'
  | 'habit'
  | 'journal_prompt'
  | 'sleep_routine'
  | 'activity'
  | 'reflection'
  | 'breathing'
  | 'goal';

export type RecommendationStatus = 'suggested' | 'accepted' | 'dismissed' | 'completed';

export interface Recommendation {
  id: string;
  kind: RecommendationKind;
  code: string;
  title: string;
  description: string;
  explanation: string;
  estimatedMinutes: number;
  source: string;
  score: number;
  status: RecommendationStatus;
  feedbackHelpful: boolean | null;
  createdAt: string;
  completedAt: string | null;
}
