import {
  type PaymentAdapter,
  type PaymentResult,
  type ProcessPaymentParams,
  TEST_CARDS,
} from './paymentTypes';

/**
 * MockPaymentAdapter
 * The default offline simulator adapter. Allows reviewers and customers
 * to test complete checkout, 3DS authentication challenge, and decline flows without network dependencies.
 */
export class MockPaymentAdapter implements PaymentAdapter {
  readonly id = 'mock' as const;
  name = 'Melbourne Offline Payment Simulator';

  isAvailable(): boolean {
    return true;
  }

  async processPayment(params: ProcessPaymentParams): Promise<PaymentResult> {
    // Simulate realistic terminal gateway latency
    await new Promise((resolve) => setTimeout(resolve, 650));

    const sanitizedCard = (params.cardNumber ?? '').replace(/\s+/g, '');
    const lastFour = sanitizedCard.slice(-4) || '4242';

    // 1. Decline simulation (ends with 0002)
    if (sanitizedCard.endsWith('0002') || sanitizedCard === TEST_CARDS.DECLINED.number.replace(/\s+/g, '')) {
      return {
        success: false,
        status: 'declined',
        paymentMethodLabel: `Test Card (•••• ${lastFour})`,
        errorMessage:
          'Payment Declined: Your card has insufficient funds or has been restricted by the issuer (Error code: 4000_DECLINED). Please check the card details or try our 4242 test card.',
      };
    }

    // 2. 3D Secure 2.0 Challenge simulation (ends with 3155)
    if (sanitizedCard.endsWith('3155') || sanitizedCard === TEST_CARDS.THREE_DS.number.replace(/\s+/g, '')) {
      return {
        success: false,
        status: 'requires_action',
        paymentMethodLabel: `Test Card (•••• ${lastFour})`,
        challengeDetails: {
          bankName: 'Melbourne Commonwealth Bank • SecureCode',
          lastFourPhone: params.customerPhone ? params.customerPhone.slice(-4) : '4410',
          challengeCode: '884210',
        },
      };
    }

    // 3. Default Success (Stripe 4242 or any other valid test number)
    const randomHex = Math.random().toString(36).substring(2, 10).toUpperCase();
    return {
      success: true,
      status: 'succeeded',
      transactionId: `txn_scb_mock_${randomHex}`,
      paymentMethodLabel: `Test Card (•••• ${lastFour})`,
    };
  }
}

export const mockPaymentAdapter = new MockPaymentAdapter();
