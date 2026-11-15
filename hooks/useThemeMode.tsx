import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';

type Mode = 'dark' | 'light';

interface ThemeModeContextValue {
  mode: Mode;
  toggle: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue>({ mode: 'dark', toggle: () => {} });

function savedMode(): Mode {
  try {
    return localStorage.getItem('theme') === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>('dark');
  const [initialized, setInitialized] = useState(false);
  const theme = useMemo(() => createTheme({ palette: { type: mode } }), [mode]);

  useEffect(() => {
    setMode(savedMode());
    setInitialized(true);
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'theme') setMode(event.newValue === 'light' ? 'light' : 'dark');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (initialized) document.documentElement.dataset.theme = mode;
  }, [mode, initialized]);

  const toggle = useCallback(() => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    try { localStorage.setItem('theme', next); } catch { /* Storage can be unavailable. */ }
  }, [mode]);

  const value = useMemo(() => ({ mode, toggle }), [mode, toggle]);
  return <ThemeModeContext.Provider value={value}><ThemeProvider theme={theme}>{children}</ThemeProvider></ThemeModeContext.Provider>;
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
