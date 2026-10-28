import { api } from '@/services/api';
import type { Paginated } from '@/types';
import type {
  AssessmentAnswer,
  AssessmentDetail,
  AssessmentHistoryItem,
  AssessmentMode,
  AssessmentResult,
  AssessmentStatsSummary,
  AssessmentSummary,
} from './types';

export const assessmentsService = {
  async list(): Promise<AssessmentSummary[]> {
    const data = await api.get<{ assessments: AssessmentSummary[] }>('/assessments');
    return data.assessments;
  },

  async getStatsSummary(): Promise<AssessmentStatsSummary> {
    return api.get<AssessmentStatsSummary>('/assessments/stats/summary');
  },

  async get(code: string, mode?: AssessmentMode): Promise<AssessmentDetail> {
    const query = mode ? `?mode=${mode}` : '';
    const data = await api.get<{ assessment: AssessmentDetail }>(`/assessments/${code}${query}`);
    return data.assessment;
  },

  async submit(
    code: string,
    answers: AssessmentAnswer[],
    priorities: string[] = [],
    mode?: AssessmentMode,
  ): Promise<AssessmentResult> {
    const data = await api.post<{ result: AssessmentResult }>(`/assessments/${code}/responses`, {
      answers,
      priorities,
      mode,
    });
    return data.result;
  },

  async history(page = 1, limit = 20): Promise<Paginated<AssessmentHistoryItem>> {
    return api.get<Paginated<AssessmentHistoryItem>>(
      `/assessments/responses?page=${page}&limit=${limit}`,
    );
  },

  async result(id: string): Promise<AssessmentResult> {
    const data = await api.get<{ result: AssessmentResult }>(`/assessments/responses/${id}`);
    return data.result;
  },
};
