/**
 * Southern Cross Burgers — Payment Service Types & Test Card Constants
 * Safe dual-adapter architecture: Mock Payment Adapter (Default offline simulator) + Stripe Test Mode
 */

export const TEST_CARDS = {
  SUCCESS: {
    number: '4242 4242 4242 4242',
    label: 'Standard Success Card',
    bank: 'Big Four Melb Bank',
    outcome: 'Immediate Authorization (Approved)',
  },
  THREE_DS: {
    number: '4000 0025 0000 3155',
    label: '3D Secure 2.0 Challenge',
    bank: 'Melbourne Commonwealth Bank',
    outcome: 'Triggers SMS OTP Challenge Modal',
  },
  DECLINED: {
    number: '4000 0000 0000 0002',
    label: 'Insufficient Funds / Declined',
    bank: 'Victorian Credit Union',
    outcome: 'Declined (Card Issuer Blocked)',
  },
} as const;

export interface ProcessPaymentParams {
  amountAUD: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvc?: string;
  cardholderName?: string;
}

export interface ChallengeDetails {
  bankName: string;
  lastFourPhone: string;
  challengeCode: string;
}

export interface PaymentResult {
  success: boolean;
  status: 'succeeded' | 'requires_action' | 'declined' | 'error';
  transactionId?: string;
  paymentMethodLabel: string;
  errorMessage?: string;
  challengeDetails?: ChallengeDetails;
}

export interface PaymentAdapter {
  id: 'mock' | 'stripe';
  name: string;
  isAvailable(): boolean;
  processPayment(params: ProcessPaymentParams): Promise<PaymentResult>;
}
