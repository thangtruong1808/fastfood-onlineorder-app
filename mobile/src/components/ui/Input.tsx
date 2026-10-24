import React, { type ReactNode } from 'react';
import {
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Input({
  label,
  error,
  leftIcon,
  rightElement,
  containerStyle,
  style,
  ...props
}: InputProps) {
  const { colors } = useTheme();

  return (
    <View style={[{ gap: 6 }, containerStyle]}>
      {label ? (
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 12,
            fontWeight: '700',
          }}
        >
          {label}
        </Text>
      ) : null}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.bgSurface,
          borderColor: error ? colors.statusDanger : colors.borderStrong,
          borderWidth: 1,
          borderRadius: 12,
          paddingHorizontal: 12,
          minHeight: 44,
          gap: 8,
        }}
      >
        {leftIcon ? <View>{leftIcon}</View> : null}
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[
            {
              flex: 1,
              color: colors.textPrimary,
              fontSize: 14,
              paddingVertical: 10,
            },
            style,
          ]}
          {...props}
        />
        {rightElement ? <View>{rightElement}</View> : null}
      </View>

      {error ? (
        <Text
          style={{
            color: colors.statusDanger,
            fontSize: 11,
            fontWeight: '600',
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

