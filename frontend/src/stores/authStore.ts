import { create } from 'zustand';
import { User } from '../types';
import { apiFetch } from '../api/client';
import { useThemeStore } from './themeStore';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('studyplatform_token'),
  isLoading: true,
  login: async (email, password) => {
    const data = await apiFetch<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem('studyplatform_token', data.token);
    set({ user: data.user, token: data.token });
    useThemeStore.getState().initTheme(data.user.themePreference);
  },
  register: async (email, password, fullName) => {
    const data = await apiFetch<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    });

    localStorage.setItem('studyplatform_token', data.token);
    set({ user: data.user, token: data.token });
    useThemeStore.getState().initTheme(data.user.themePreference);
  },
  logout: () => {
    localStorage.removeItem('studyplatform_token');
    set({ user: null, token: null });
  },
  checkAuth: async () => {
    const token = localStorage.getItem('studyplatform_token');
    if (!token) {
      set({ isLoading: false, user: null });
      useThemeStore.getState().initTheme();
      return;
    }

    try {
      const user = await apiFetch<User>('/auth/me');
      set({ user, isLoading: false });
      useThemeStore.getState().initTheme(user.themePreference);
    } catch (err) {
      localStorage.removeItem('studyplatform_token');
      set({ user: null, token: null, isLoading: false });
      useThemeStore.getState().initTheme();
    }
  },
}));
