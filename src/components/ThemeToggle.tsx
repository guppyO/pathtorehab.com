'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration safety pattern
    setMounted(true);
  }, []);

  // CRITICAL: Loading state must have aria-label for accessibility
  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    setTheme(themes[(currentIndex + 1) % themes.length]);
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
      aria-label={`Current theme: ${theme}. Click to change.`}
    >
      {theme === 'light' && <Sun className="w-5 h-5 text-amber-500" />}
      {theme === 'dark' && <Moon className="w-5 h-5 text-slate-300" />}
      {theme === 'system' && <Monitor className="w-5 h-5 text-teal-700 dark:text-teal-400" />}
    </button>
  );
}
