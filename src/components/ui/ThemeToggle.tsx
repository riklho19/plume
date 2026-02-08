import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { IconButton } from './IconButton';
import { UI } from '../../lib/constants';

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <IconButton
      label={theme === 'light' ? UI.darkMode : UI.lightMode}
      onClick={toggleTheme}
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </IconButton>
  );
}
