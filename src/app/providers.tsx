import { Tooltip } from 'radix-ui';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import { store } from '@/app/store';
import { useTheme } from '@/hooks/useTheme';

function ThemeAndToastWrapper({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();

  return (
    <Tooltip.Provider delayDuration={200}>
      {children}
      <Toaster
        theme={resolvedTheme}
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          className: 'font-sans',
        }}
      />
    </Tooltip.Provider>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeAndToastWrapper>{children}</ThemeAndToastWrapper>
    </Provider>
  );
}
