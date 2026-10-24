import { PROMO_DEALS } from '@/data/promosSeed';
import { MELBOURNE_STORES } from '@/data/storesSeed';
import { calculateIncludedGST, roundCurrency } from '@/lib/currency';
import type { CartItem, FulfillmentMode, PromoDeal } from '@/types';

export interface CartCalculationResult {
  itemsCount: number;
  subtotal: number;
  discountAmount: number;
  appliedPromo: PromoDeal | null;
  promoError: string | null;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  freeDeliveryShortfall: number;
  gstIncluded: number;
  total: number;
}

/**
 * Calculates subtotal across all cart items taking into account their unit prices and quantities.
 */
export function calculateCartSubtotal(items: CartItem[]): number {
  const sum = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  return roundCurrency(sum);
}

/**
 * Computes the full financial breakdown of the cart for Melbourne Australian context.
 * Standard GST in Australia is 10%, included in the total.
 */
export function calculateCartTotals(params: {
  items: CartItem[];
  promoCode: string | null;
  fulfillmentMode: FulfillmentMode;
  selectedStoreId?: string;
}): CartCalculationResult {
  const { items, promoCode, fulfillmentMode, selectedStoreId } = params;

  const itemsCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = calculateCartSubtotal(items);

  const activeStore =
    MELBOURNE_STORES.find((s) => s.id === selectedStoreId) ?? MELBOURNE_STORES[0];

  const freeDeliveryThreshold = activeStore.freeDeliveryThreshold ?? 35.0;
  const standardDeliveryFee = activeStore.deliveryFee ?? 4.95;

  let appliedPromo: PromoDeal | null = null;
  let promoError: string | null = null;
  let discountAmount = 0;
  let isFreeDeliveryPromo = false;

  if (promoCode && promoCode.trim()) {
    const normalizedCode = promoCode.trim().toUpperCase();
    const deal = PROMO_DEALS.find((d) => d.code === normalizedCode);

    if (!deal) {
      promoError = `Code "${normalizedCode}" is invalid`;
    } else if (subtotal < deal.minOrderAmount) {
      promoError = `${deal.code} requires a minimum spend of A$${deal.minOrderAmount.toFixed(2)}`;
    } else {
      appliedPromo = deal;
      if (deal.discountType === 'percentage') {
        discountAmount = roundCurrency((subtotal * deal.discountValue) / 100);
      } else if (deal.discountType === 'fixed') {
        discountAmount = Math.min(subtotal, deal.discountValue);
      } else if (deal.discountType === 'free_delivery') {
        isFreeDeliveryPromo = true;
      }
    }
  }

  // Delivery fee calculation
  let deliveryFee = 0;
  let freeDeliveryShortfall = 0;

  if (fulfillmentMode === 'delivery') {
    if (subtotal <= 0) {
      deliveryFee = 0;
    } else if (isFreeDeliveryPromo || subtotal >= freeDeliveryThreshold) {
      deliveryFee = 0;
      freeDeliveryShortfall = 0;
    } else {
      deliveryFee = standardDeliveryFee;
      freeDeliveryShortfall = roundCurrency(Math.max(0, freeDeliveryThreshold - subtotal));
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const total = roundCurrency(discountedSubtotal + deliveryFee);
  const gstIncluded = calculateIncludedGST(total);

  return {
    itemsCount,
    subtotal,
    discountAmount,
    appliedPromo,
    promoError,
    deliveryFee,
    freeDeliveryThreshold,
    freeDeliveryShortfall,
    gstIncluded,
    total,
  };
}

