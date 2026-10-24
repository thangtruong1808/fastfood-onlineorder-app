import { mockPaymentAdapter } from './mockPaymentAdapter';
import { type PaymentAdapter } from './paymentTypes';
import { stripePaymentAdapter } from './stripePaymentAdapter';

export * from './mockPaymentAdapter';
export * from './paymentTypes';
export * from './stripePaymentAdapter';

/**
 * Returns the configured mobile payment adapter.
 * Controlled by EXPO_PUBLIC_PAYMENT_ADAPTER ('mock' | 'stripe').
 * Defaults to 'mock' for reliable offline iOS Simulator & Android Emulator demos.
 */
export function getPaymentAdapter(): PaymentAdapter {
  const configured = process.env.EXPO_PUBLIC_PAYMENT_ADAPTER;

  if (configured === 'stripe' && stripePaymentAdapter.isAvailable()) {
    return stripePaymentAdapter;
  }

  return mockPaymentAdapter;
}

