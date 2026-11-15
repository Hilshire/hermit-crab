import { useThemeMode } from '../hooks/useThemeMode';

export function ThemeToggle() {
  const { mode, toggle } = useThemeMode();
  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label={mode === 'dark' ? '切换浅色主题' : '切换深色主题'}>
      {mode === 'dark' ? '浅色' : '深色'}
    </button>
  );
}
