import React, { type ReactNode } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export type BadgeTone =
  | 'default'
  | 'brand'
  | 'amber'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export function Badge({ tone = 'default', children, className, style }: BadgeProps) {
  const { colors, isDark } = useTheme();

  const getToneColors = (): { bg: string; text: string; border: string } => {
    switch (tone) {
      case 'brand':
        return {
          bg: isDark ? 'rgba(239, 68, 68, 0.16)' : 'rgba(217, 56, 30, 0.12)',
          text: colors.brandPrimary,
          border: isDark ? 'rgba(239, 68, 68, 0.35)' : 'rgba(217, 56, 30, 0.25)',
        };
      case 'amber':
        return {
          bg: isDark ? 'rgba(245, 158, 11, 0.18)' : 'rgba(217, 119, 6, 0.14)',
          text: colors.brandSecondary,
          border: isDark ? 'rgba(245, 158, 11, 0.35)' : 'rgba(217, 119, 6, 0.3)',
        };
      case 'success':
        return {
          bg: isDark ? 'rgba(34, 197, 94, 0.16)' : 'rgba(21, 128, 61, 0.12)',
          text: colors.statusSuccess,
          border: isDark ? 'rgba(34, 197, 94, 0.35)' : 'rgba(21, 128, 61, 0.25)',
        };
      case 'warning':
        return {
          bg: isDark ? 'rgba(245, 158, 11, 0.18)' : 'rgba(180, 83, 9, 0.14)',
          text: colors.statusWarning,
          border: isDark ? 'rgba(245, 158, 11, 0.35)' : 'rgba(180, 83, 9, 0.3)',
        };
      case 'danger':
        return {
          bg: isDark ? 'rgba(248, 113, 113, 0.16)' : 'rgba(185, 28, 28, 0.12)',
          text: colors.statusDanger,
          border: isDark ? 'rgba(248, 113, 113, 0.35)' : 'rgba(185, 28, 28, 0.25)',
        };
      case 'info':
        return {
          bg: isDark ? 'rgba(96, 165, 250, 0.16)' : 'rgba(29, 78, 216, 0.12)',
          text: colors.statusInfo,
          border: isDark ? 'rgba(96, 165, 250, 0.35)' : 'rgba(29, 78, 216, 0.25)',
        };
      case 'default':
      default:
        return {
          bg: colors.bgElevated,
          text: colors.textSecondary,
          border: colors.borderSubtle,
        };
    }
  };

  const palette = getToneColors();

  return (
    <View
      className={className}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          gap: 4,
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderWidth: 1,
          borderRadius: 999,
          paddingHorizontal: 9,
          paddingVertical: 3,
        },
        style,
      ]}
    >
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text
          style={{
            color: palette.text,
            fontSize: 11,
            fontWeight: '700',
          }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

