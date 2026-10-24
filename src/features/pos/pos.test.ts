import { describe, expect, it } from 'vitest';
import { calculateIncludedGST, roundCurrency } from '@/lib/currency';

interface PosTicketItem {
  cartItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

function calculatePosTicketTotals(params: {
  items: PosTicketItem[];
  discountPercent?: number;
  discountFixed?: number;
}) {
  const subtotal = roundCurrency(
    params.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  );

  let discountAmount = 0;
  if (params.discountPercent && params.discountPercent > 0) {
    discountAmount = roundCurrency((subtotal * params.discountPercent) / 100);
  } else if (params.discountFixed && params.discountFixed > 0) {
    discountAmount = Math.min(subtotal, params.discountFixed);
  }

  const total = roundCurrency(Math.max(0, subtotal - discountAmount));
  const gstIncluded = calculateIncludedGST(total);

  return { subtotal, discountAmount, total, gstIncluded };
}

function calculateCashChange(totalDue: number, tenderedAmount: number) {
  if (tenderedAmount < totalDue) {
    return { sufficient: false, changeDue: 0, shortfall: roundCurrency(totalDue - tenderedAmount) };
  }
  return {
    sufficient: true,
    changeDue: roundCurrency(tenderedAmount - totalDue),
    shortfall: 0,
  };
}

describe('Point-of-Sale (POS) Register Calculations & Tender Math', () => {
  it('accurately computes POS ticket subtotal and 10% Australian GST', () => {
    const items: PosTicketItem[] = [
      { cartItemId: 'scb-1', name: 'Signature Burger', unitPrice: 16.9, quantity: 2 },
      { cartItemId: 'scb-2', name: 'Rosemary Chips', unitPrice: 6.5, quantity: 1 },
    ];

    const result = calculatePosTicketTotals({ items });
    // (16.90 * 2) + 6.50 = 33.80 + 6.50 = 40.30
    expect(result.subtotal).toBe(40.3);
    expect(result.total).toBe(40.3);
    // 40.30 / 11 = 3.6636... -> 3.66
    expect(result.gstIncluded).toBe(3.66);
  });

  it('applies quick POS staff discount (10%) accurately', () => {
    const items: PosTicketItem[] = [
      { cartItemId: 'scb-1', name: 'Truffle Smash Combo', unitPrice: 24.0, quantity: 1 },
    ];

    const result = calculatePosTicketTotals({ items, discountPercent: 10 });
    expect(result.subtotal).toBe(24.0);
    expect(result.discountAmount).toBe(2.4);
    expect(result.total).toBe(21.6);
  });

  it('calculates cash tender change due correctly', () => {
    const totalDue = 34.5;

    // Exact cash
    const exact = calculateCashChange(totalDue, 34.5);
    expect(exact.sufficient).toBe(true);
    expect(exact.changeDue).toBe(0);

    // Paid with $50 note
    const paidFifty = calculateCashChange(totalDue, 50.0);
    expect(paidFifty.sufficient).toBe(true);
    expect(paidFifty.changeDue).toBe(15.5);

    // Paid with insufficient cash ($30)
    const insufficient = calculateCashChange(totalDue, 30.0);
    expect(insufficient.sufficient).toBe(false);
    expect(insufficient.shortfall).toBe(4.5);
  });
});

