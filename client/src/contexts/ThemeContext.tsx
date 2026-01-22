import { createContext, useContext, useEffect, useState } from 'react';

export type ColorMode = 'light' | 'dark';

interface ThemeContextType {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const COLOR_MODE_STORAGE_KEY = 'maya-color-mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorMode, setColorModeState] = useState<ColorMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(COLOR_MODE_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    root.classList.remove('light', 'dark');
    root.classList.add('theme-maya');
    root.classList.add(colorMode);
    
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, colorMode);
  }, [colorMode]);

  const setColorMode = (mode: ColorMode) => {
    setColorModeState(mode);
  };

  const toggleColorMode = () => {
    setColorModeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ 
      colorMode, 
      setColorMode, 
      toggleColorMode 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
