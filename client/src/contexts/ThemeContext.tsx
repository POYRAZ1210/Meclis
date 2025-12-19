import { createContext, useContext, useEffect, useState } from 'react';

export type DesignTheme = 'maya' | 'framer';
export type ColorMode = 'light' | 'dark';

interface ThemeContextType {
  designTheme: DesignTheme;
  colorMode: ColorMode;
  setDesignTheme: (theme: DesignTheme) => void;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'maya-design-theme';
const COLOR_MODE_STORAGE_KEY = 'maya-color-mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [designTheme, setDesignThemeState] = useState<DesignTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'maya' || saved === 'framer') return saved;
    }
    return 'maya';
  });

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
    
    root.classList.remove('theme-maya', 'theme-framer', 'light', 'dark');
    root.classList.add(`theme-${designTheme}`);
    root.classList.add(colorMode);
    
    localStorage.setItem(THEME_STORAGE_KEY, designTheme);
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, colorMode);
  }, [designTheme, colorMode]);

  const setDesignTheme = (theme: DesignTheme) => {
    setDesignThemeState(theme);
  };

  const setColorMode = (mode: ColorMode) => {
    setColorModeState(mode);
  };

  const toggleColorMode = () => {
    setColorModeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ 
      designTheme, 
      colorMode, 
      setDesignTheme, 
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
