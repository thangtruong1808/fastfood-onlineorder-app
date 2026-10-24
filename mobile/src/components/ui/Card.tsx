import React, { type ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface CardProps {
  children: ReactNode;
  interactive?: boolean;
  onPress?: () => void;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export function Card({
  children,
  interactive = false,
  onPress,
  className,
  style,
}: CardProps) {
  const { colors, isDark } = useTheme();

  const baseCardStyle: ViewStyle = {
    backgroundColor: colors.bgSurface,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: isDark ? 0.35 : 0.06,
    shadowRadius: 8,
    elevation: 2,
  };

  if (interactive || onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={className}
        style={({ pressed }) => [
          baseCardStyle,
          pressed && {
            borderColor: colors.brandPrimary,
            transform: [{ scale: 0.99 }],
          },
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View className={className} style={[baseCardStyle, style]}>
      {children}
    </View>
  );
}

