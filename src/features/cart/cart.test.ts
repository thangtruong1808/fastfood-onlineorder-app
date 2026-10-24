import { describe, expect, it } from 'vitest';
import { calculateCartSubtotal, calculateCartTotals } from '@/features/cart/cartSelectors';
import type { CartItem } from '@/types';

function createMockCartItem(params: {
  id: string;
  unitPrice: number;
  quantity: number;
}): CartItem {
  return {
    cartItemId: params.id,
    menuItemId: params.id,
    name: 'Test Item',
    imageUrl: 'https://example.com/test.jpg',
    categoryId: 'burgers',
    basePrice: params.unitPrice,
    unitPrice: params.unitPrice,
    quantity: params.quantity,
    customization: {
      sizeId: 'regular',
      sizeLabel: 'Regular',
      isCombo: false,
      selectedAddOns: [],
      removedIngredients: [],
    },
  };
}

describe('Cart Calculation Engine & AUD/GST breakdown', () => {
  it('computes subtotal correctly across line items with quantities', () => {
    const items: CartItem[] = [
      createMockCartItem({ id: 'item-1', unitPrice: 16.9, quantity: 2 }), // 33.80
      createMockCartItem({ id: 'item-2', unitPrice: 6.5, quantity: 1 }), // 6.50
    ];

    expect(calculateCartSubtotal(items)).toBe(40.3);
  });

  it('calculates pickup fulfillment with zero delivery fee', () => {
    const items: CartItem[] = [
      createMockCartItem({ id: 'item-1', unitPrice: 20.0, quantity: 1 }),
    ];

    const result = calculateCartTotals({
      items,
      promoCode: null,
      fulfillmentMode: 'pickup',
    });

    expect(result.subtotal).toBe(20.0);
    expect(result.deliveryFee).toBe(0);
    expect(result.total).toBe(20.0);
    expect(result.gstIncluded).toBe(1.82); // 20 / 11 rounded
  });

  it('calculates delivery fee when under threshold and provides free delivery above threshold', () => {
    // Under A$35 threshold
    const underItems: CartItem[] = [
      createMockCartItem({ id: 'item-1', unitPrice: 20.0, quantity: 1 }),
    ];

    const underResult = calculateCartTotals({
      items: underItems,
      promoCode: null,
      fulfillmentMode: 'delivery',
      selectedStoreId: 'melb-fitzroy-brunswick',
    });

    expect(underResult.deliveryFee).toBe(3.5);
    expect(underResult.freeDeliveryShortfall).toBe(15.0); // 35 - 20
    expect(underResult.total).toBe(23.5);

    // Over A$35 threshold
    const overItems: CartItem[] = [
      createMockCartItem({ id: 'item-1', unitPrice: 36.0, quantity: 1 }),
    ];

    const overResult = calculateCartTotals({
      items: overItems,
      promoCode: null,
      fulfillmentMode: 'delivery',
      selectedStoreId: 'melb-fitzroy',
    });

    expect(overResult.deliveryFee).toBe(0);
    expect(overResult.freeDeliveryShortfall).toBe(0);
    expect(overResult.total).toBe(36.0);
  });

  it('applies percentage promo code MELB15 (15% off when subtotal >= A$25)', () => {
    const items: CartItem[] = [
      createMockCartItem({ id: 'item-1', unitPrice: 30.0, quantity: 1 }),
    ];

    const result = calculateCartTotals({
      items,
      promoCode: 'MELB15',
      fulfillmentMode: 'pickup',
    });

    expect(result.appliedPromo?.code).toBe('MELB15');
    expect(result.discountAmount).toBe(4.5); // 15% of 30.0
    expect(result.total).toBe(25.5);
  });

  it('rejects promo code when order is below minimum spend requirement', () => {
    const items: CartItem[] = [
      createMockCartItem({ id: 'item-1', unitPrice: 15.0, quantity: 1 }),
    ];

    const result = calculateCartTotals({
      items,
      promoCode: 'MELB15', // requires $25
      fulfillmentMode: 'pickup',
    });

    expect(result.appliedPromo).toBeNull();
    expect(result.promoError).toContain('requires a minimum spend');
    expect(result.discountAmount).toBe(0);
    expect(result.total).toBe(15.0);
  });

  it('applies FREEDEL code to waive delivery fee on eligible order', () => {
    const items: CartItem[] = [
      createMockCartItem({ id: 'item-1', unitPrice: 22.0, quantity: 1 }),
    ];

    const result = calculateCartTotals({
      items,
      promoCode: 'FREEDEL',
      fulfillmentMode: 'delivery',
    });

    expect(result.appliedPromo?.code).toBe('FREEDEL');
    expect(result.deliveryFee).toBe(0);
    expect(result.total).toBe(22.0);
  });
});
