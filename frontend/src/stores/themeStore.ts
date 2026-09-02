import { create } from 'zustand';
import { apiFetch } from '../api/client';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initTheme: (preference?: 'light' | 'dark' | 'system') => void;
}

const getInitialTheme = (): Theme => {
  try {
    const saved = localStorage.getItem('studyplatform_theme') as Theme | null;
    if (saved === 'dark' || saved === 'light') return saved;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch (_) {}
  return 'light';
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  setTheme: (theme: Theme) => {
    localStorage.setItem('studyplatform_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });

    // Sync to backend if logged in
    apiFetch('/auth/theme', {
      method: 'PATCH',
      body: JSON.stringify({ themePreference: theme }),
    }).catch(() => {});
  },
  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(next);
  },
  initTheme: (preference) => {
    let initial: Theme = 'light';
    const saved = localStorage.getItem('studyplatform_theme') as Theme | null;

    if (saved) {
      initial = saved;
    } else if (preference && preference !== 'system') {
      initial = preference;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      initial = 'dark';
    }

    get().setTheme(initial);
  },
}));
