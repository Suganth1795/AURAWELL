import { api } from '@/services/api';
import type { Paginated } from '@/types';
import type {
  AssessmentAnswer,
  AssessmentDetail,
  AssessmentHistoryItem,
  AssessmentResult,
  AssessmentSummary,
} from './types';

export const assessmentsService = {
  async list(): Promise<AssessmentSummary[]> {
    const data = await api.get<{ assessments: AssessmentSummary[] }>('/assessments');
    return data.assessments;
  },

  async get(code: string): Promise<AssessmentDetail> {
    const data = await api.get<{ assessment: AssessmentDetail }>(`/assessments/${code}`);
    return data.assessment;
  },

  async submit(
    code: string,
    answers: AssessmentAnswer[],
    priorities: string[] = [],
  ): Promise<AssessmentResult> {
    const data = await api.post<{ result: AssessmentResult }>(`/assessments/${code}/responses`, {
      answers,
      priorities,
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
