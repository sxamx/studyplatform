import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Cambiar tema"
      className="p-2.5 rounded-lg border border-[#E0E0E0] dark:border-[#2D2D2D] bg-white dark:bg-[#1A1A1A] text-[#666666] hover:text-[#1A1A1A] dark:text-[#B0B0B0] dark:hover:text-white transition-all duration-150 hover:bg-[#F5F5F5] dark:hover:bg-[#242424]"
      title={theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
    >
      {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
    </button>
  );
};
