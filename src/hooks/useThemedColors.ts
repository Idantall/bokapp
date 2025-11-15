import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/lib/theme';

export function useThemedColors() {
  const { isDark } = useTheme();
  return getColors(isDark);
}

