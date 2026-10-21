import { api } from '@/services/api';
import type { AnalyticsOverview } from './types';

export const analyticsService = {
  async overview(days = 14): Promise<AnalyticsOverview> {
    return api.get<AnalyticsOverview>(`/analytics/overview?days=${days}`);
  },
};
