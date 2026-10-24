import {
  type PaymentAdapter,
  type PaymentResult,
  type ProcessPaymentParams,
} from './paymentTypes';

/**
 * StripePaymentAdapter
 * Connects to Stripe Test Mode via the Vercel serverless function `/api/create-payment-intent`.
 * Safely validates amounts and ensures secrets are never exposed on client.
 */
export class StripePaymentAdapter implements PaymentAdapter {
  readonly id = 'stripe' as const;
  name = 'Stripe Test Mode Gateway';

  private publishableKey: string;

  constructor() {
    this.publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
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
      const response = await fetch('/api/create-payment-intent', {
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
            `Serverless API error (${response.status}). Ensure STRIPE_SECRET_KEY is configured in Vercel or run 'vercel dev'.`,
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
          'Stripe publishable key (VITE_STRIPE_PUBLISHABLE_KEY) is not configured in .env.local. The app seamlessly falls back to the Mock Payment Adapter.',
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

    // In a full Stripe Elements environment, the client secret is passed to stripe.confirmPayment().
    // For test simulation when the backend responds with a clientSecret:
    return {
      success: true,
      status: 'succeeded',
      transactionId: `pi_stripe_${intentResult.clientSecret.slice(0, 14)}`,
      paymentMethodLabel: 'Stripe Card (Test Mode)',
    };
  }
}

export const stripePaymentAdapter = new StripePaymentAdapter();
