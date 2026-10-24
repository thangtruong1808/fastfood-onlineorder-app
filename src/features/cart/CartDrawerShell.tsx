import {
  ArrowRight,
  Bike,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  TicketPercent,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { MENU_ITEMS } from '@/data/menuSeed';
import { PROMO_DEALS } from '@/data/promosSeed';
import { calculateCartTotals } from '@/features/cart/cartSelectors';
import {
  addCartItem,
  applyPromoCode,
  removeCartItem,
  setCartDrawerOpen,
  updateCartItemQuantity,
} from '@/features/cart/cartSlice';
import { cn } from '@/lib/cn';
import { formatAUD } from '@/lib/currency';
import type { CartItem, MenuItem } from '@/types';

export function CartDrawerShell() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { items, promoCode, isCartDrawerOpen } = useAppSelector((state) => state.cart);
  const { fulfillmentMode, selectedStoreId } = useAppSelector((state) => state.store);

  const [promoInput, setPromoInput] = useState('');

  const totals = calculateCartTotals({
    items,
    promoCode,
    fulfillmentMode,
    selectedStoreId,
  });

  // Smart Upsells: pick popular sides, drinks, or desserts not currently in the cart
  const currentMenuItemIds = new Set(items.map((i) => i.menuItemId));
  const upsellCandidates = MENU_ITEMS.filter(
    (item) =>
      !currentMenuItemIds.has(item.id) &&
      (item.categoryId === 'sides' || item.categoryId === 'drinks' || item.categoryId === 'desserts'),
  ).slice(0, 4);

  const handleApplyCustomPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    dispatch(applyPromoCode(promoInput.trim()));
    setPromoInput('');
  };

  const handleQuickAddUpsell = (item: MenuItem) => {
    const regularSize = item.sizeOptions[0] ?? {
      id: 'regular',
      label: 'Regular',
      priceDelta: 0,
      caloriesDelta: 0,
    };

    const cartItem: CartItem = {
      cartItemId: `${item.id}-upsell-regular`,
      menuItemId: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      categoryId: item.categoryId,
      basePrice: item.basePrice,
      unitPrice: item.basePrice,
      quantity: 1,
      customization: {
        sizeId: 'regular',
        sizeLabel: regularSize.label,
        isCombo: false,
        selectedAddOns: [],
        removedIngredients: [],
      },
    };

    dispatch(addCartItem(cartItem));
    toast.success(`Added ${item.name} to order bag`);
  };

  const handleProceedToCheckout = () => {
    dispatch(setCartDrawerOpen(false));
    navigate('/checkout');
  };

  return (
    <Drawer
      open={isCartDrawerOpen}
      onOpenChange={(open) => dispatch(setCartDrawerOpen(open))}
      title="Your Southern Cross Bag"
      subtitle={`${totals.itemsCount} ${totals.itemsCount === 1 ? 'item' : 'items'} • AUD ($) incl. 10% GST`}
      footer={
        items.length > 0 ? (
          <div className="space-y-4">
            {/* AUD & GST Breakdown Card */}
            <div className="space-y-2 rounded-2xl border border-border-subtle bg-bg-surface p-4 text-xs">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal ({totals.itemsCount} items)</span>
                <span className="font-semibold text-text-primary">
                  {formatAUD(totals.subtotal)}
                </span>
              </div>

              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <TicketPercent className="h-3.5 w-3.5" />
                    <span>Promo ({totals.appliedPromo?.code})</span>
                  </span>
                  <span>-{formatAUD(totals.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-text-secondary">
                <span className="flex items-center gap-1">
                  <Bike className="h-3.5 w-3.5 text-text-muted" />
                  <span>
                    {fulfillmentMode === 'pickup' ? 'Pickup at Kitchen' : 'Melbourne Delivery'}
                  </span>
                </span>
                <span className="font-semibold text-text-primary">
                  {totals.deliveryFee === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[11px]">
                      FREE
                    </span>
                  ) : (
                    formatAUD(totals.deliveryFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-text-muted text-[11px] border-t border-border-subtle pt-2">
                <span>Includes 10% Australian GST</span>
                <span>{formatAUD(totals.gstIncluded)}</span>
              </div>

              <div className="flex justify-between items-baseline border-t border-border-subtle pt-2 text-sm font-bold text-text-primary">
                <span>Estimated Total</span>
                <span className="font-display text-lg font-extrabold text-brand-primary">
                  {formatAUD(totals.total)}
                </span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <Button
              variant="primary"
              size="lg"
              className="w-full shadow-md"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={handleProceedToCheckout}
            >
              Proceed to Checkout • {formatAUD(totals.total)}
            </Button>
          </div>
        ) : undefined
      }
    >
      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8 text-brand-primary" />}
          title="Your order bag is empty"
          description="Explore our flame-grilled Gippsland beef burgers, crispy free-range chicken, and rosemary sea-salt chips."
          actionLabel="Browse Melbourne Menu"
          onAction={() => {
            dispatch(setCartDrawerOpen(false));
            navigate('/menu');
          }}
        />
      ) : (
        <div className="space-y-6 pb-4">
          {/* Free Delivery Progress Bar (Delivery mode only) */}
          {fulfillmentMode === 'delivery' && (
            <div className="rounded-2xl border border-brand-primary/20 bg-gradient-to-r from-brand-primary/10 to-amber-500/10 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-text-primary">
                <span className="flex items-center gap-1.5">
                  <Bike className="h-4 w-4 text-brand-primary" />
                  {totals.freeDeliveryShortfall > 0
                    ? `Add ${formatAUD(totals.freeDeliveryShortfall)} more for FREE delivery!`
                    : '🎉 You have unlocked FREE Melbourne delivery!'}
                </span>
                <span className="text-brand-primary text-[11px]">
                  {totals.freeDeliveryShortfall > 0
                    ? `${formatAUD(totals.subtotal)} / ${formatAUD(totals.freeDeliveryThreshold)}`
                    : 'FREE'}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-border-subtle">
                <div
                  className="h-full rounded-full bg-brand-primary transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (totals.subtotal / totals.freeDeliveryThreshold) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Cart Line Items */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Order Items ({items.length})
            </h3>
            {items.map((item) => (
              <div
                key={item.cartItemId}
                className="relative flex flex-col gap-3 rounded-2xl border border-border-subtle bg-bg-surface p-3.5 shadow-2xs transition-all hover:border-border-strong"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-16 w-16 shrink-0 rounded-xl object-cover border border-border-subtle bg-neutral-900"
                    />
                    <div className="space-y-1">
                      <h4 className="font-display text-sm font-bold text-text-primary leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-xs font-semibold text-brand-primary">
                        {formatAUD(item.unitPrice)} ea
                      </p>

                      {/* Customization Details */}
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        <span className="rounded-md bg-bg-elevated px-1.5 py-0.5 text-[10px] font-bold text-text-secondary">
                          {item.customization.sizeLabel}
                        </span>
                        {item.customization.isCombo && (
                          <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                            Meal ({item.customization.comboSide?.split(' ')[0]} + {item.customization.comboDrink?.split(' ')[0]})
                          </span>
                        )}
                        {item.customization.selectedAddOns.map((addon) => (
                          <span
                            key={addon.id}
                            className="rounded-md bg-brand-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand-primary"
                          >
                            +{addon.name.replace('Extra ', '')}
                          </span>
                        ))}
                        {item.customization.removedIngredients.map((rem) => (
                          <span
                            key={rem}
                            className="rounded-md bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-red-600 dark:text-red-400 line-through"
                          >
                            {rem}
                          </span>
                        ))}
                      </div>

                      {item.customization.specialInstructions && (
                        <p className="text-[11px] italic text-text-muted pt-0.5">
                          Note: &quot;{item.customization.specialInstructions}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => dispatch(removeCartItem(item.cartItemId))}
                    className="rounded-lg p-1.5 text-text-muted hover:bg-bg-elevated hover:text-red-500 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Stepper & Line Total */}
                <div className="flex items-center justify-between border-t border-border-subtle pt-2">
                  <div className="flex items-center rounded-xl border border-border-strong bg-bg-elevated p-0.5">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() =>
                        dispatch(
                          updateCartItemQuantity({
                            cartItemId: item.cartItemId,
                            quantity: item.quantity - 1,
                          }),
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-surface cursor-pointer"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-text-primary">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() =>
                        dispatch(
                          updateCartItemQuantity({
                            cartItemId: item.cartItemId,
                            quantity: item.quantity + 1,
                          }),
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-surface cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <span className="font-display text-sm font-extrabold text-text-primary">
                    {formatAUD(item.unitPrice * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Smart Upsell Carousel */}
          {upsellCandidates.length > 0 && (
            <div className="space-y-2.5 rounded-2xl border border-border-subtle bg-bg-elevated/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-brand-primary" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                    Complete Your Meal
                  </h4>
                </div>
                <span className="text-[10px] text-text-muted">1-Click Add</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {upsellCandidates.map((upsell) => (
                  <div
                    key={upsell.id}
                    className="flex flex-col justify-between rounded-xl border border-border-subtle bg-bg-surface p-2.5 shadow-2xs hover:border-brand-primary/50 transition-colors"
                  >
                    <div className="flex gap-2">
                      <img
                        src={upsell.imageUrl}
                        alt={upsell.name}
                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-text-primary truncate">
                          {upsell.name}
                        </p>
                        <p className="text-[11px] font-semibold text-brand-primary">
                          {formatAUD(upsell.basePrice)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 h-7 w-full text-[11px] font-bold"
                      leftIcon={<Plus className="h-3 w-3" />}
                      onClick={() => handleQuickAddUpsell(upsell)}
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Promo Code Input & Quick Apply Chips */}
          <div className="space-y-2 rounded-2xl border border-border-subtle bg-bg-surface p-4">
            <div className="flex items-center justify-between">
              <label htmlFor="promo-input" className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <TicketPercent className="h-3.5 w-3.5 text-brand-primary" />
                <span>Promo Code</span>
              </label>
              {promoCode && (
                <button
                  type="button"
                  onClick={() => dispatch(applyPromoCode(null))}
                  className="text-[11px] font-semibold text-red-500 hover:underline cursor-pointer"
                >
                  Remove Code
                </button>
              )}
            </div>

            <form onSubmit={handleApplyCustomPromo} className="flex gap-2">
              <input
                id="promo-input"
                type="text"
                placeholder="e.g. MELB15, FLAME10"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                className="flex-1 rounded-xl border border-border-strong bg-bg-elevated px-3 py-2 text-xs font-bold uppercase tracking-wider text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none"
              />
              <Button type="submit" variant="secondary" size="sm" className="px-3 text-xs">
                Apply
              </Button>
            </form>

            {/* Quick Demo Promo Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-text-muted">Try:</span>
              {PROMO_DEALS.map((deal) => {
                const isActive = promoCode === deal.code;
                return (
                  <button
                    key={deal.code}
                    type="button"
                    onClick={() => dispatch(applyPromoCode(deal.code))}
                    className={cn(
                      'rounded-md px-2 py-0.5 font-mono text-[10px] font-bold transition-all cursor-pointer',
                      isActive
                        ? 'bg-brand-primary text-white'
                        : 'border border-dashed border-brand-primary/40 bg-brand-primary/8 text-brand-primary hover:bg-brand-primary/15',
                    )}
                  >
                    {deal.code} ({deal.badgeText})
                  </button>
                );
              })}
            </div>

            {/* Promo Error or Success Feedback */}
            {totals.promoError && (
              <p className="text-xs font-semibold text-red-500 pt-1">
                {totals.promoError}
              </p>
            )}
            {totals.appliedPromo && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <Badge tone="success">{totals.appliedPromo.badgeText}</Badge>
                <span>{totals.appliedPromo.title}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}
