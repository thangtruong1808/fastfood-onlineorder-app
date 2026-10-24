import { Monitor, Moon, Sun } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import type { ThemeMode } from '@/types';

const THEME_OPTIONS: { mode: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { mode: 'light', label: 'Light', Icon: Sun },
  { mode: 'dark', label: 'Dark', Icon: Moon },
  { mode: 'system', label: 'Auto', Icon: Monitor },
];

export interface ThemeToggleProps {
  compact?: boolean;
}

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { theme, setTheme, colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgElevated,
        borderColor: colors.borderSubtle,
        borderWidth: 1,
        borderRadius: 12,
        padding: 3,
        gap: 2,
      }}
    >
      {THEME_OPTIONS.map(({ mode, label, Icon }) => {
        const isActive = theme === mode;
        return (
          <Pressable
            key={mode}
            onPress={() => setTheme(mode)}
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${label} theme`}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              paddingHorizontal: compact ? 7 : 10,
              paddingVertical: 5,
              borderRadius: 9,
              backgroundColor: isActive ? colors.bgSurface : 'transparent',
            }}
          >
            <Icon
              size={14}
              color={isActive ? colors.brandPrimary : colors.textMuted}
            />
            {!compact ? (
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: isActive ? colors.brandPrimary : colors.textSecondary,
                }}
              >
                {label}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

