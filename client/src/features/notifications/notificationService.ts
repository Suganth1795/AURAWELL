import { api } from '@/services/api';
import type { AppNotification, NotificationsResult } from './types';

export const notificationService = {
  async list(limit = 15): Promise<NotificationsResult> {
    return api.get<NotificationsResult>(`/notifications?limit=${limit}`);
  },

  async markRead(id: string): Promise<AppNotification> {
    const data = await api.post<{ notification: AppNotification }>(`/notifications/${id}/read`);
    return data.notification;
  },

  async markAllRead(): Promise<number> {
    const data = await api.post<{ updated: number }>('/notifications/read-all');
    return data.updated;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};
