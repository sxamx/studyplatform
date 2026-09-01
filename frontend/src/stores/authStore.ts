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

const getSavedUser = (): User | null => {
  try {
    const raw = localStorage.getItem('studyplatform_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getSavedUser(),
  token: localStorage.getItem('studyplatform_token'),
  isLoading: true,
  login: async (email, password) => {
    const data = await apiFetch<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const user = data.user;
    localStorage.setItem('studyplatform_token', data.token);
    localStorage.setItem('studyplatform_user', JSON.stringify(user));
    set({ user, token: data.token });
    useThemeStore.getState().initTheme(user.themePreference);
  },
  register: async (email, password, fullName) => {
    const data = await apiFetch<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    });

    const user = data.user;
    localStorage.setItem('studyplatform_token', data.token);
    localStorage.setItem('studyplatform_user', JSON.stringify(user));
    set({ user, token: data.token });
    useThemeStore.getState().initTheme(user.themePreference);
  },
  logout: () => {
    localStorage.removeItem('studyplatform_token');
    localStorage.removeItem('studyplatform_user');
    set({ user: null, token: null });
  },
  checkAuth: async () => {
    const token = localStorage.getItem('studyplatform_token');
    if (!token) {
      localStorage.removeItem('studyplatform_user');
      set({ isLoading: false, user: null });
      useThemeStore.getState().initTheme();
      return;
    }

    try {
      const data = await apiFetch<any>('/auth/me');
      const user: User = data?.user ? data.user : data;
      if (user && user.id) {
        localStorage.setItem('studyplatform_user', JSON.stringify(user));
        set({ user, isLoading: false });
        useThemeStore.getState().initTheme(user.themePreference);
      } else {
        throw new Error('Invalid user payload');
      }
    } catch {
      localStorage.removeItem('studyplatform_token');
      localStorage.removeItem('studyplatform_user');
      set({ user: null, token: null, isLoading: false });
      useThemeStore.getState().initTheme();
    }
  },
}));
