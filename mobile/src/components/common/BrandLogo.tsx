import { Flame, Sparkles } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface BrandLogoProps {
  compact?: boolean;
}

export function BrandLogo({ compact = false }: BrandLogoProps) {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View
        style={{
          height: compact ? 34 : 38,
          width: compact ? 34 : 38,
          borderRadius: 12,
          backgroundColor: colors.brandPrimary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Flame size={compact ? 18 : 20} color="#FFFFFF" />
        <View
          style={{
            position: 'absolute',
            top: -3,
            right: -3,
            height: 14,
            width: 14,
            borderRadius: 7,
            backgroundColor: colors.brandAccent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Sparkles size={8} color="#1F1714" />
        </View>
      </View>

      <View>
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: compact ? 15 : 16,
            fontWeight: '900',
            letterSpacing: -0.3,
          }}
        >
          Southern Cross
        </Text>
        <Text
          style={{
            color: colors.brandPrimary,
            fontSize: 9,
            fontWeight: '800',
            letterSpacing: 1.2,
            textTransform: 'uppercase',
          }}
        >
          Burgers • Melbourne
        </Text>
      </View>
    </View>
  );
}

