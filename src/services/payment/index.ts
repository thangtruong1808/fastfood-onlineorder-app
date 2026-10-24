import { mockPaymentAdapter } from './mockPaymentAdapter';
import { type PaymentAdapter } from './paymentTypes';
import { stripePaymentAdapter } from './stripePaymentAdapter';

export * from './mockPaymentAdapter';
export * from './paymentTypes';
export * from './stripePaymentAdapter';

/**
 * Returns the configured payment adapter.
 * Controlled by VITE_PAYMENT_ADAPTER environment variable.
 * Defaults to 'mock' for safe offline demonstration.
 */
export function getPaymentAdapter(): PaymentAdapter {
  const configured = import.meta.env.VITE_PAYMENT_ADAPTER;

  if (configured === 'stripe' && stripePaymentAdapter.isAvailable()) {
    return stripePaymentAdapter;
  }

  return mockPaymentAdapter;
}

