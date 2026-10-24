import { X } from 'lucide-react-native';
import React, { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface BottomSheetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function BottomSheetModal({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
  footer,
}: BottomSheetModalProps) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent
      onRequestClose={() => onOpenChange(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.62)',
          justifyContent: 'flex-end',
        }}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={() => onOpenChange(false)}
          accessibilityLabel="Close sheet backdrop"
        />

        <View
          style={{
            maxHeight: '90%',
            backgroundColor: colors.bgSurface,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderColor: colors.borderSubtle,
            borderTopWidth: 1,
            overflow: 'hidden',
          }}
        >
          {/* Drag Handle */}
          <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 999,
                backgroundColor: colors.borderStrong,
              }}
            />
          </View>

          {/* Sheet Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 18,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.borderSubtle,
            }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 18,
                  fontWeight: '800',
                }}
              >
                {title}
              </Text>
              {subtitle ? (
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  {subtitle}
                </Text>
              ) : null}
            </View>

            <Pressable
              onPress={() => onOpenChange(false)}
              accessibilityRole="button"
              accessibilityLabel="Close modal"
              style={{
                height: 34,
                width: 34,
                borderRadius: 17,
                backgroundColor: colors.bgElevated,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Scrollable Body */}
          <ScrollView
            contentContainerStyle={{ padding: 18, paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {/* Optional Sticky Footer */}
          {footer ? (
            <View
              style={{
                paddingHorizontal: 18,
                paddingTop: 12,
                paddingBottom: Platform.OS === 'ios' ? 28 : 16,
                backgroundColor: colors.bgSurface,
                borderTopWidth: 1,
                borderTopColor: colors.borderSubtle,
              }}
            >
              {footer}
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

