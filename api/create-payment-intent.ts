import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey || stripeSecretKey.includes('replace_with_your')) {
    return res.status(500).json({
      error:
        'STRIPE_SECRET_KEY is not configured in environment variables. To test Stripe Test Mode, set STRIPE_SECRET_KEY in Vercel project settings or .env.local.',
    });
  }

  try {
    const { amount, orderNumber, customerEmail } = req.body as {
      amount?: number;
      orderNumber?: string;
      customerEmail?: string;
    };

    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid order amount.' });
    }

    // Convert AUD amount to cents (Stripe requires smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    // Minimum Stripe charge is 50 cents AUD
    if (amountInCents < 50) {
      return res.status(400).json({ error: 'Amount must be at least A$0.50 AUD.' });
    }

    // Reasonable safety cap for fast food order demo (A$5,000)
    if (amountInCents > 500000) {
      return res.status(400).json({ error: 'Order amount exceeds demonstration limit.' });
    }

    const stripe = new Stripe(stripeSecretKey);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'aud',
      payment_method_types: ['card'],
      receipt_email: customerEmail,
      metadata: {
        brand: 'Southern Cross Burgers Melbourne',
        orderNumber: orderNumber || 'SCB-DEMO',
      },
      description: `Southern Cross Burgers - Order ${orderNumber || 'Demo'}`,
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Stripe error';
    return res.status(500).json({ error: message });
  }
}

