import { api } from '@/services/api';
import type { DataExportBundle, PrivacyOverview } from './types';

export const privacyService = {
  async overview(): Promise<PrivacyOverview> {
    return api.get<PrivacyOverview>('/privacy/overview');
  },

  async exportData(): Promise<DataExportBundle> {
    return api.get<DataExportBundle>('/privacy/export');
  },
};
