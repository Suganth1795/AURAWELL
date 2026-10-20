import { api } from '@/services/api';
import type {
  AiStatus,
  ChatMessage,
  ChatSession,
  CounselingIntro,
  SendMessageResult,
} from './types';

export const counselingService = {
  async intro(): Promise<CounselingIntro> {
    return api.get<CounselingIntro>('/counseling/intro');
  },

  async listSessions(): Promise<ChatSession[]> {
    const data = await api.get<{ sessions: ChatSession[] }>('/counseling/sessions');
    return data.sessions;
  },

  async createSession(title?: string): Promise<ChatSession> {
    const data = await api.post<{ session: ChatSession }>('/counseling/sessions', { title });
    return data.session;
  },

  async getSession(
    id: string,
  ): Promise<{ session: ChatSession; messages: ChatMessage[] }> {
    return api.get<{ session: ChatSession; messages: ChatMessage[] }>(`/counseling/sessions/${id}`);
  },

  async sendMessage(id: string, content: string): Promise<SendMessageResult> {
    return api.post<SendMessageResult>(`/counseling/sessions/${id}/messages`, { content });
  },

  async closeSession(id: string): Promise<ChatSession> {
    const data = await api.post<{ session: ChatSession }>(`/counseling/sessions/${id}/close`);
    return data.session;
  },

  async deleteSession(id: string): Promise<void> {
    await api.delete(`/counseling/sessions/${id}`);
  },

  async aiStatus(): Promise<AiStatus> {
    return api.get<AiStatus>('/ai/status');
  },
};
