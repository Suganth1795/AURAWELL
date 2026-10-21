import {
  Activity,
  BookOpen,
  CheckCircle2,
  Gamepad2,
  Moon,
  Sparkles,
  Target,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import { api } from '@/services/api';
import type { Recommendation, RecommendationKind, RecommendationStatus } from './types';

export const recommendationService = {
  async list(options: { status?: RecommendationStatus; kind?: RecommendationKind; limit?: number } = {}): Promise<
    Recommendation[]
  > {
    const params = new URLSearchParams();
    if (options.status) params.set('status', options.status);
    if (options.kind) params.set('kind', options.kind);
    params.set('limit', String(options.limit ?? 20));
    const data = await api.get<{ recommendations: Recommendation[] }>(
      `/recommendations?${params.toString()}`,
    );
    return data.recommendations;
  },

  async update(
    id: string,
    input: { status?: RecommendationStatus; feedbackHelpful?: boolean },
  ): Promise<Recommendation> {
    const data = await api.patch<{ recommendation: Recommendation }>(`/recommendations/${id}`, input);
    return data.recommendation;
  },
};

const KIND_ICONS: Record<RecommendationKind, LucideIcon> = {
  game: Gamepad2,
  habit: CheckCircle2,
  journal_prompt: BookOpen,
  sleep_routine: Moon,
  activity: Activity,
  reflection: Sparkles,
  breathing: Wind,
  goal: Target,
};

export function iconForKind(kind: RecommendationKind): LucideIcon {
  return KIND_ICONS[kind] ?? Sparkles;
}

/** Maps a recommendation to the in-app route that puts it into practice. */
export function routeForKind(kind: RecommendationKind, code: string): string {
  switch (kind) {
    case 'game':
      return `/games/${code}`;
    case 'habit':
      return '/habits';
    case 'journal_prompt':
      return '/journal';
    case 'sleep_routine':
      return '/sleep';
    case 'activity':
      return '/activity';
    case 'breathing':
    case 'reflection':
      return '/counseling';
    case 'goal':
      return '/dashboard';
    default:
      return '/dashboard';
  }
}
