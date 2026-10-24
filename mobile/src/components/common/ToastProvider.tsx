import * as Haptics from 'expo-haptics';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react-native';
import React, { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';

export type ToastTone = 'success' | 'error' | 'info';

export interface ShowToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
}

interface ToastContextValue {
  showToast: (options: ShowToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ShowToastOptions | null>(null);

  const showToast = useCallback((options: ShowToastOptions) => {
    setToast(options);

    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(
        options.tone === 'error'
          ? Haptics.NotificationFeedbackType.Error
          : Haptics.NotificationFeedbackType.Success,
      ).catch(() => {});
    }

    setTimeout(() => {
      setToast((current) => (current === options ? null : current));
    }, 2800);
  }, []);

  const tone = toast?.tone ?? 'success';
  const accentColor =
    tone === 'error'
      ? colors.statusDanger
      : tone === 'info'
        ? colors.brandSecondary
        : colors.statusSuccess;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast ? (
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            top: Math.max(insets.top + 8, 16),
            left: 16,
            right: 16,
            zIndex: 999,
          }}
        >
          <Pressable
            onPress={() => setToast(null)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: colors.brandDark,
              borderColor: accentColor,
              borderWidth: 1.5,
              borderRadius: 16,
              paddingHorizontal: 14,
              paddingVertical: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {tone === 'error' ? (
              <AlertCircle size={18} color={accentColor} />
            ) : tone === 'info' ? (
              <Info size={18} color={accentColor} />
            ) : (
              <CheckCircle2 size={18} color={accentColor} />
            )}

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: '800',
                }}
              >
                {toast.title}
              </Text>
              {toast.description ? (
                <Text
                  style={{
                    color: 'rgba(254, 243, 199, 0.85)',
                    fontSize: 11,
                    marginTop: 2,
                  }}
                >
                  {toast.description}
                </Text>
              ) : null}
            </View>
          </Pressable>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

