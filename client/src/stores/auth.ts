import { create } from 'zustand';
import { api, ensureCsrf, ApiError } from '@/services/api';
import type { User } from '@/types';

interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
  birthYear?: number;
  guardianConsent?: boolean;
  guardianName?: string;
  consents: { termsOfService: boolean; privacyPolicy: boolean; aiWellnessData: boolean };
}

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'authenticated' | 'anonymous';
  error: string | null;
  initializing: boolean;
  init: () => Promise<void>;
  fetchMe: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',
  error: null,
  initializing: true,

  init: async () => {
    set({ initializing: true });
    try {
      await ensureCsrf();
      const { user } = await api.get<{ user: User }>('/auth/me');
      set({ user, status: 'authenticated', initializing: false });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        set({ user: null, status: 'anonymous', initializing: false });
      } else {
        set({ user: null, status: 'anonymous', initializing: false });
      }
    }
  },

  fetchMe: async () => {
    try {
      const { user } = await api.get<{ user: User }>('/auth/me');
      set({ user, status: 'authenticated' });
    } catch {
      set({ user: null, status: 'anonymous' });
    }
  },

  login: async (email, password) => {
    set({ error: null, status: 'loading' });
    try {
      const { user } = await api.post<{ user: User }>('/auth/login', { email, password });
      set({ user, status: 'authenticated' });
    } catch (error) {
      set({
        status: 'anonymous',
        error: error instanceof ApiError ? error.message : 'Login failed',
      });
      throw error;
    }
  },

  register: async (payload) => {
    set({ error: null, status: 'loading' });
    try {
      const { user } = await api.post<{ user: User }>('/auth/register', payload);
      set({ user, status: 'authenticated' });
    } catch (error) {
      set({
        status: 'anonymous',
        error: error instanceof ApiError ? error.message : 'Registration failed',
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      set({ user: null, status: 'anonymous' });
    }
  },

  setUser: (user) => set({ user }),
  clearError: () => set({ error: null }),
}));
