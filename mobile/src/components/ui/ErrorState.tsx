import { AlertTriangle, RotateCcw } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Melbourne Kitchen Gateway Unavailable (503)',
  message = 'Simulated Kitchen API Outage: Connection timed out. Tap Retry to recover cleanly.',
  onRetry,
}: ErrorStateProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: isDark ? 'rgba(248, 113, 113, 0.1)' : 'rgba(185, 28, 28, 0.06)',
        borderColor: isDark ? 'rgba(248, 113, 113, 0.35)' : 'rgba(185, 28, 28, 0.25)',
        borderWidth: 1,
        borderRadius: 22,
        gap: 10,
      }}
    >
      <View
        style={{
          height: 48,
          width: 48,
          borderRadius: 16,
          backgroundColor: isDark ? 'rgba(248, 113, 113, 0.2)' : 'rgba(185, 28, 28, 0.14)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AlertTriangle size={24} color={colors.statusDanger} />
      </View>

      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 16,
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
        }}
      >
        {message}
      </Text>

      {onRetry ? (
        <View style={{ marginTop: 6 }}>
          <Button
            variant="danger"
            size="md"
            leftIcon={<RotateCcw size={15} color="#FFFFFF" />}
            onPress={onRetry}
          >
            Retry Connection
          </Button>
        </View>
      ) : null}
    </View>
  );
}

