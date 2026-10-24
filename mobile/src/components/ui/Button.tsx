import React, { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  children,
  className,
  style,
  fullWidth = false,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();

  const getBackgroundStyle = (pressed: boolean): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: pressed ? colors.brandPrimaryHover : colors.brandPrimary,
        };
      case 'secondary':
        return {
          backgroundColor: colors.brandSecondary,
          opacity: pressed ? 0.9 : 1,
        };
      case 'outline':
        return {
          backgroundColor: pressed ? colors.bgElevated : colors.bgSurface,
          borderWidth: 1,
          borderColor: colors.borderStrong,
        };
      case 'ghost':
        return {
          backgroundColor: pressed ? colors.bgElevated : 'transparent',
        };
      case 'danger':
        return {
          backgroundColor: colors.statusDanger,
          opacity: pressed ? 0.9 : 1,
        };
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return '#FFFFFF';
      case 'outline':
        return colors.textPrimary;
      case 'ghost':
        return colors.textSecondary;
    }
  };

  const sizeStyles: Record<ButtonSize, ViewStyle> = {
    sm: { minHeight: 34, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    md: { minHeight: 42, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 12 },
    lg: { minHeight: 50, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
    icon: { height: 40, width: 40, borderRadius: 12, padding: 0 },
  };

  const textSizes: Record<ButtonSize, number> = {
    sm: 12,
    md: 14,
    lg: 15,
    icon: 14,
  };

  const textColor = getTextColor();

  return (
    <Pressable
      disabled={disabled || isLoading}
      className={className}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
          opacity: disabled || isLoading ? 0.55 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          width: fullWidth ? '100%' : undefined,
        },
        sizeStyles[size],
        getBackgroundStyle(pressed),
        style,
      ]}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : leftIcon ? (
        <View>{leftIcon}</View>
      ) : null}

      {typeof children === 'string' || typeof children === 'number' ? (
        <Text
          style={{
            color: textColor,
            fontSize: textSizes[size],
            fontWeight: size === 'lg' ? '800' : '700',
          }}
        >
          {children}
        </Text>
      ) : (
        children
      )}

      {!isLoading && rightIcon ? <View>{rightIcon}</View> : null}
    </Pressable>
  );
}

