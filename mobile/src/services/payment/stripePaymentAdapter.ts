import { Platform } from 'react-native';
import {
  type PaymentAdapter,
  type PaymentResult,
  type ProcessPaymentParams,
} from './paymentTypes';

/**
 * StripePaymentAdapter (Mobile — Test Mode Only)
 * Connects to Stripe Test Mode via `/api/create-payment-intent`.
 * Automatically maps `localhost` to `10.0.2.2` on Android Emulator when using local dev server.
 */
export class StripePaymentAdapter implements PaymentAdapter {
  readonly id = 'stripe' as const;
  name = 'Stripe Test Mode Gateway';

  private publishableKey: string;
  private apiBaseUrl: string;

  constructor() {
    this.publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
    const rawBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    this.apiBaseUrl =
      Platform.OS === 'android'
        ? rawBaseUrl.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2')
        : rawBaseUrl;
  }

  isAvailable(): boolean {
    return Boolean(
      this.publishableKey &&
        this.publishableKey.startsWith('pk_test_') &&
        !this.publishableKey.includes('replace_with_your'),
    );
  }

  async createPaymentIntent(params: {
    amountAUD: number;
    orderNumber: string;
    customerEmail: string;
  }): Promise<{ clientSecret: string } | { error: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: params.amountAUD,
          orderNumber: params.orderNumber,
          customerEmail: params.customerEmail,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { error?: string };
        return {
          error:
            errorData.error ||
            `Serverless API error (${response.status}). Ensure STRIPE_SECRET_KEY is configured.`,
        };
      }

      const data = (await response.json()) as { clientSecret: string };
      return { clientSecret: data.clientSecret };
    } catch (err) {
      return {
        error:
          err instanceof Error
            ? err.message
            : 'Could not reach /api/create-payment-intent. Defaulting to Mock Adapter is recommended for offline preview.',
      };
    }
  }

  async processPayment(params: ProcessPaymentParams): Promise<PaymentResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        status: 'error',
        paymentMethodLabel: 'Stripe Test Mode',
        errorMessage:
          'Stripe publishable test key (EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY) is not configured. Using Mock Payment Adapter is recommended for offline demo.',
      };
    }

    const intentResult = await this.createPaymentIntent({
      amountAUD: params.amountAUD,
      orderNumber: params.orderNumber,
      customerEmail: params.customerEmail,
    });

    if ('error' in intentResult) {
      return {
        success: false,
        status: 'error',
        paymentMethodLabel: 'Stripe Test Mode',
        errorMessage: intentResult.error,
      };
    }

    return {
      success: true,
      status: 'succeeded',
      transactionId: `pi_stripe_${intentResult.clientSecret.slice(0, 14)}`,
      paymentMethodLabel: 'Stripe Card (Test Mode)',
    };
  }
}

export const stripePaymentAdapter = new StripePaymentAdapter();

