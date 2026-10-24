import React, { type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 36,
        paddingHorizontal: 20,
        backgroundColor: colors.bgSurface,
        borderColor: colors.borderSubtle,
        borderWidth: 1,
        borderRadius: 24,
        gap: 12,
      }}
    >
      {icon ? (
        <View
          style={{
            height: 56,
            width: 56,
            borderRadius: 18,
            backgroundColor: colors.bgElevated,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </View>
      ) : null}

      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 18,
          fontWeight: '800',
          textAlign: 'center',
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 13,
          lineHeight: 19,
          textAlign: 'center',
          maxWidth: 320,
        }}
      >
        {description}
      </Text>

      {actionLabel && onAction ? (
        <View style={{ marginTop: 6 }}>
          <Button variant="primary" size="md" onPress={onAction}>
            {actionLabel}
          </Button>
        </View>
      ) : null}
    </View>
  );
}

