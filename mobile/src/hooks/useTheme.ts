import { useEffect } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setThemeMode } from '@/app/simulatorSlice';
import { THEME_PALETTE, type ThemePalette } from '@/lib/themeColors';
import type { ThemeMode } from '@/types';

export function useTheme(): {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  colors: ThemePalette;
  isDark: boolean;
  setTheme: (mode: ThemeMode) => void;
} {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.simulator.theme);
  const systemScheme = useRNColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();

  const resolvedTheme: 'light' | 'dark' =
    theme === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : theme;

  useEffect(() => {
    try {
      setColorScheme(theme === 'system' ? 'system' : theme);
    } catch {
      // Safe fallback if NativeWind color scheme controller is initializing
    }
  }, [theme, setColorScheme]);

  const setTheme = (mode: ThemeMode) => {
    dispatch(setThemeMode(mode));
  };

  return {
    theme,
    resolvedTheme,
    colors: THEME_PALETTE[resolvedTheme],
    isDark: resolvedTheme === 'dark',
    setTheme,
  };
}

