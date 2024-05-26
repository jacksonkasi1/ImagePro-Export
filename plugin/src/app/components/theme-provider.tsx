import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

function getStoredTheme(storageKey: string, defaultTheme: Theme): Theme {
  try {
    return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
  } catch {
    return defaultTheme;
  }
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme(storageKey, defaultTheme));
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;

    const applyTheme = (currentTheme: Theme) => {
      root.classList.remove('light', 'dark');

      if (currentTheme === 'system') {
        root.classList.add(systemTheme);
      } else {
        root.classList.add(currentTheme);
      }
    };

    applyTheme(theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      setSystemTheme(newSystemTheme);
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme, systemTheme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch {
        // Handle the error silently
      }
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
