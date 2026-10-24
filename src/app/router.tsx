import { createBrowserRouter } from 'react-router';
import { RootLayout } from '@/app/layouts/RootLayout';
import { RouteLoadingFallback } from '@/components/common/RouteLoadingFallback';

export function createAppRouter() {
  return createBrowserRouter([
    {
      path: '/',
      element: <RootLayout />,
      hydrateFallbackElement: <RouteLoadingFallback />,
      children: [
        {
          index: true,
          lazy: async () => {
            const mod = await import('@/features/menu/HomePage');
            return { Component: mod.default };
          },
        },
        {
          path: 'menu',
          lazy: async () => {
            const mod = await import('@/features/menu/MenuPage');
            return { Component: mod.default };
          },
        },
        {
          path: 'checkout',
          lazy: async () => {
            const mod = await import('@/features/checkout/CheckoutShellPage');
            return { Component: mod.default };
          },
        },
        {
          path: 'orders/:orderId',
          lazy: async () => {
            const mod = await import('@/features/tracking/TrackingShellPage');
            return { Component: mod.default };
          },
        },
        {
          path: 'account',
          lazy: async () => {
            const mod = await import('@/features/orders/CustomerDashboardShellPage');
            return { Component: mod.default };
          },
        },
        {
          path: 'admin',
          lazy: async () => {
            const mod = await import('@/features/dashboard/AdminDashboardShellPage');
            return { Component: mod.default };
          },
        },
        {
          path: 'login',
          lazy: async () => {
            const mod = await import('@/features/auth-mock/DemoLoginPage');
            return { Component: mod.default };
          },
        },
      ],
    },
    {
      path: '/pos',
      lazy: async () => {
        const mod = await import('@/features/pos/PosTerminalPage');
        return { Component: mod.default };
      },
    },
  ]);
}
