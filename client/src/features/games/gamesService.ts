import { api } from '@/services/api';
import type { Paginated } from '@/types';
import type {
  GameDetail,
  GameSession,
  GameSessionResult,
  GameStatsResponse,
  GameSubmitResponse,
  GameSummary,
} from './types';

export const gamesService = {
  async list(): Promise<GameSummary[]> {
    const data = await api.get<{ games: GameSummary[] }>('/games');
    return data.games;
  },

  async get(code: string): Promise<GameDetail> {
    const data = await api.get<{ game: GameDetail }>(`/games/${code}`);
    return data.game;
  },

  async submit(result: GameSessionResult): Promise<GameSubmitResponse> {
    return api.post<GameSubmitResponse>('/games/sessions', result);
  },

  async history(page = 1, limit = 20): Promise<Paginated<GameSession>> {
    return api.get<Paginated<GameSession>>(`/games/sessions?page=${page}&limit=${limit}`);
  },

  async stats(): Promise<GameStatsResponse> {
    return api.get<GameStatsResponse>('/games/stats');
  },
};

/** Stable per-round key so retries never double-reward XP. */
export function newIdempotencyKey(gameCode: string): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${gameCode}-${Date.now()}-${random}`;
}
