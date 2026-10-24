import { useRouter } from 'expo-router';
import {
  ArrowRight,
  Bike,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  TicketPercent,
  Trash2,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useToast } from '@/components/common/ToastProvider';
import { Badge } from '@/components/ui/Badge';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { MENU_ITEMS } from '@/data/menuSeed';
import { PROMO_DEALS } from '@/data/promosSeed';
import { calculateCartTotals } from '@/features/cart/cartSelectors';
import {
  addCartItem,
  applyPromoCode,
  clearCart,
  removeCartItem,
  setCartDrawerOpen,
  updateCartItemQuantity,
} from '@/features/cart/cartSlice';
import { useTheme } from '@/hooks/useTheme';
import { formatAUD } from '@/lib/currency';
import type { CartItem, MenuItem } from '@/types';

export function CartSheetModal() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { colors } = useTheme();
  const { showToast } = useToast();

  const { items, promoCode, isCartDrawerOpen } = useAppSelector((state) => state.cart);
  const { fulfillmentMode, selectedStoreId } = useAppSelector((state) => state.store);

  const [promoInput, setPromoInput] = useState('');

  const totals = calculateCartTotals({
    items,
    promoCode,
    fulfillmentMode,
    selectedStoreId,
  });

  // Smart Upsells: popular sides, drinks, or desserts not currently in the bag
  const currentMenuItemIds = new Set(items.map((i) => i.menuItemId));
  const upsellCandidates = MENU_ITEMS.filter(
    (item) =>
      !currentMenuItemIds.has(item.id) &&
      (item.categoryId === 'sides' ||
        item.categoryId === 'drinks' ||
        item.categoryId === 'desserts'),
  ).slice(0, 4);

  const handleApplyPromoInput = () => {
    if (!promoInput.trim()) return;
    const code = promoInput.trim().toUpperCase();
    dispatch(applyPromoCode(code));
    setPromoInput('');
    showToast({
      title: `Promo code ${code} applied`,
      tone: 'info',
    });
  };

  const handleQuickAddUpsell = (item: MenuItem) => {
    const regularSize = item.sizeOptions[0] ?? {
      id: 'regular' as const,
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
    showToast({
      title: `Added ${item.name} to order bag`,
      tone: 'success',
    });
  };

  const handleProceedToCheckout = () => {
    dispatch(setCartDrawerOpen(false));
    router.push('/checkout');
  };

  const freeDeliveryProgressPct =
    totals.freeDeliveryThreshold > 0
      ? Math.min(100, Math.round((totals.subtotal / totals.freeDeliveryThreshold) * 100))
      : 100;

  return (
    <BottomSheetModal
      open={isCartDrawerOpen}
      onOpenChange={(open) => dispatch(setCartDrawerOpen(open))}
      title="Your Southern Cross Bag"
      subtitle={`${totals.itemsCount} ${totals.itemsCount === 1 ? 'item' : 'items'} • AUD ($) incl. 10% GST`}
      footer={
        items.length > 0 ? (
          <View style={{ gap: 12 }}>
            {/* AUD & 10% Australian GST Breakdown Card */}
            <View
              style={{
                backgroundColor: colors.bgElevated,
                borderColor: colors.borderSubtle,
                borderWidth: 1,
                borderRadius: 16,
                padding: 12,
                gap: 6,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  Subtotal ({totals.itemsCount} items)
                </Text>
                <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '700' }}>
                  {formatAUD(totals.subtotal)}
                </Text>
              </View>

              {totals.discountAmount > 0 ? (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <TicketPercent size={13} color={colors.statusSuccess} />
                    <Text
                      style={{
                        color: colors.statusSuccess,
                        fontSize: 12,
                        fontWeight: '700',
                      }}
                    >
                      Promo ({totals.appliedPromo?.code})
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: colors.statusSuccess,
                      fontSize: 12,
                      fontWeight: '800',
                    }}
                  >
                    -{formatAUD(totals.discountAmount)}
                  </Text>
                </View>
              ) : null}

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Bike size={13} color={colors.textMuted} />
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                    {fulfillmentMode === 'pickup'
                      ? 'Pickup at Kitchen'
                      : 'Melbourne Delivery'}
                  </Text>
                </View>
                <Text
                  style={{
                    color:
                      totals.deliveryFee === 0 ? colors.statusSuccess : colors.textPrimary,
                    fontSize: 12,
                    fontWeight: '800',
                  }}
                >
                  {totals.deliveryFee === 0 ? 'FREE' : formatAUD(totals.deliveryFee)}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingTop: 6,
                  borderTopWidth: 1,
                  borderTopColor: colors.borderSubtle,
                }}
              >
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                  Includes 10% Australian GST
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                  {formatAUD(totals.gstIncluded)}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  paddingTop: 6,
                  borderTopWidth: 1,
                  borderTopColor: colors.borderSubtle,
                }}
              >
                <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '800' }}>
                  Estimated Total
                </Text>
                <Text
                  style={{
                    color: colors.brandPrimary,
                    fontSize: 18,
                    fontWeight: '900',
                  }}
                >
                  {formatAUD(totals.total)}
                </Text>
              </View>
            </View>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              rightIcon={<ArrowRight size={16} color="#FFFFFF" />}
              onPress={handleProceedToCheckout}
            >
              Proceed to Checkout • {formatAUD(totals.total)}
            </Button>
          </View>
        ) : undefined
      }
    >
      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={28} color={colors.brandPrimary} />}
          title="Your order bag is empty"
          description="Explore our flame-grilled Gippsland beef burgers, crispy free-range chicken, and rosemary sea-salt chips."
          actionLabel="Browse Melbourne Menu"
          onAction={() => {
            dispatch(setCartDrawerOpen(false));
            router.push('/(tabs)/menu');
          }}
        />
      ) : (
        <View style={{ gap: 16 }}>
          {/* Free Delivery Progress Bar (when Delivery mode is selected) */}
          {fulfillmentMode === 'delivery' ? (
            <View
              style={{
                backgroundColor: colors.bgElevated,
                borderColor: colors.borderSubtle,
                borderWidth: 1,
                borderRadius: 16,
                padding: 12,
                gap: 8,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                  <Bike size={15} color={colors.brandPrimary} />
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontSize: 12,
                      fontWeight: '700',
                      flex: 1,
                    }}
                  >
                    {totals.freeDeliveryShortfall > 0
                      ? `Add ${formatAUD(totals.freeDeliveryShortfall)} more for FREE Melbourne Delivery`
                      : 'Unlocked FREE Melbourne Delivery!'}
                  </Text>
                </View>
                <Badge tone={totals.freeDeliveryShortfall > 0 ? 'amber' : 'success'}>
                  {freeDeliveryProgressPct}%
                </Badge>
              </View>

              <View
                style={{
                  height: 7,
                  borderRadius: 999,
                  backgroundColor: colors.bgMuted,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${freeDeliveryProgressPct}%`,
                    backgroundColor:
                      totals.freeDeliveryShortfall > 0
                        ? colors.brandPrimary
                        : colors.statusSuccess,
                  }}
                />
              </View>
            </View>
          ) : null}

          {/* Bag Items List */}
          <View style={{ gap: 10 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '800' }}>
                Order Items ({totals.itemsCount})
              </Text>
              <Pressable
                onPress={() => {
                  dispatch(clearCart());
                  showToast({ title: 'Order bag cleared', tone: 'info' });
                }}
              >
                <Text
                  style={{
                    color: colors.statusDanger,
                    fontSize: 12,
                    fontWeight: '700',
                  }}
                >
                  Clear Bag
                </Text>
              </Pressable>
            </View>

            {items.map((item) => (
              <View
                key={item.cartItemId}
                style={{
                  backgroundColor: colors.bgSurface,
                  borderColor: colors.borderSubtle,
                  borderWidth: 1,
                  borderRadius: 16,
                  padding: 12,
                  gap: 10,
                }}
              >
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 12,
                      backgroundColor: '#1F1714',
                    }}
                  />

                  <View style={{ flex: 1, gap: 3 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 6,
                      }}
                    >
                      <Text
                        numberOfLines={1}
                        style={{
                          flex: 1,
                          color: colors.textPrimary,
                          fontSize: 14,
                          fontWeight: '800',
                        }}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={{
                          color: colors.brandPrimary,
                          fontSize: 14,
                          fontWeight: '900',
                        }}
                      >
                        {formatAUD(item.unitPrice * item.quantity)}
                      </Text>
                    </View>

                    {/* Customization Pills */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                      <Badge tone="default">{item.customization.sizeLabel}</Badge>
                      {item.customization.isCombo ? (
                        <Badge tone="amber">COMBO MEAL</Badge>
                      ) : null}
                    </View>

                    {item.customization.isCombo ? (
                      <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                        • {item.customization.comboSide} + {item.customization.comboDrink}
                      </Text>
                    ) : null}

                    {item.customization.selectedAddOns.length > 0 ? (
                      <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                        + {item.customization.selectedAddOns.map((a) => a.name).join(', ')}
                      </Text>
                    ) : null}

                    {item.customization.removedIngredients.length > 0 ? (
                      <Text style={{ color: colors.statusDanger, fontSize: 11 }}>
                        {item.customization.removedIngredients.join(', ')}
                      </Text>
                    ) : null}

                    {item.customization.specialInstructions ? (
                      <Text
                        style={{
                          color: colors.textMuted,
                          fontSize: 11,
                          fontStyle: 'italic',
                        }}
                      >
                        Note: "{item.customization.specialInstructions}"
                      </Text>
                    ) : null}
                  </View>
                </View>

                {/* Quantity Stepper & Remove Button */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: colors.borderSubtle,
                  }}
                >
                  <Pressable
                    onPress={() => dispatch(removeCartItem(item.cartItemId))}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      paddingVertical: 4,
                    }}
                  >
                    <Trash2 size={14} color={colors.textMuted} />
                    <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700' }}>
                      Remove
                    </Text>
                  </Pressable>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      backgroundColor: colors.bgElevated,
                      borderRadius: 10,
                      padding: 3,
                    }}
                  >
                    <Pressable
                      onPress={() =>
                        dispatch(
                          updateCartItemQuantity({
                            cartItemId: item.cartItemId,
                            quantity: item.quantity - 1,
                          }),
                        )
                      }
                      style={{
                        height: 28,
                        width: 28,
                        borderRadius: 8,
                        backgroundColor: colors.bgSurface,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Minus size={13} color={colors.textPrimary} />
                    </Pressable>

                    <Text
                      style={{
                        minWidth: 18,
                        textAlign: 'center',
                        color: colors.textPrimary,
                        fontSize: 13,
                        fontWeight: '800',
                      }}
                    >
                      {item.quantity}
                    </Text>

                    <Pressable
                      onPress={() =>
                        dispatch(
                          updateCartItemQuantity({
                            cartItemId: item.cartItemId,
                            quantity: item.quantity + 1,
                          }),
                        )
                      }
                      style={{
                        height: 28,
                        width: 28,
                        borderRadius: 8,
                        backgroundColor: colors.bgSurface,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Plus size={13} color={colors.textPrimary} />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Smart Upsells Carousel */}
          {upsellCandidates.length > 0 ? (
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Sparkles size={15} color={colors.brandSecondary} />
                <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '800' }}>
                  Complete Your Melbourne Meal
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10 }}
              >
                {upsellCandidates.map((upsell) => (
                  <View
                    key={upsell.id}
                    style={{
                      width: 175,
                      backgroundColor: colors.bgElevated,
                      borderColor: colors.borderSubtle,
                      borderWidth: 1,
                      borderRadius: 14,
                      padding: 10,
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <View style={{ gap: 3 }}>
                      <Text
                        numberOfLines={1}
                        style={{
                          color: colors.textPrimary,
                          fontSize: 12,
                          fontWeight: '800',
                        }}
                      >
                        {upsell.name}
                      </Text>
                      <Text style={{ color: colors.textMuted, fontSize: 10 }}>
                        {upsell.nutrition.calories} kcal
                      </Text>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text
                        style={{
                          color: colors.brandPrimary,
                          fontSize: 13,
                          fontWeight: '900',
                        }}
                      >
                        {formatAUD(upsell.basePrice)}
                      </Text>
                      <Pressable
                        onPress={() => handleQuickAddUpsell(upsell)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 3,
                          backgroundColor: colors.brandPrimary,
                          paddingHorizontal: 9,
                          paddingVertical: 5,
                          borderRadius: 8,
                        }}
                      >
                        <Plus size={12} color="#FFFFFF" />
                        <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>
                          Add
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* Promo Code Section */}
          <View
            style={{
              backgroundColor: colors.bgSurface,
              borderColor: colors.borderSubtle,
              borderWidth: 1,
              borderRadius: 16,
              padding: 12,
              gap: 10,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TicketPercent size={15} color={colors.brandPrimary} />
              <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '800' }}>
                Melbourne Promo Code
              </Text>
            </View>

            {/* Quick Promo Chips */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {PROMO_DEALS.map((deal) => {
                const isCurrent = promoCode === deal.code;
                return (
                  <Pressable
                    key={deal.id}
                    onPress={() =>
                      dispatch(applyPromoCode(isCurrent ? null : deal.code))
                    }
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: isCurrent ? colors.brandPrimary : colors.borderStrong,
                      backgroundColor: isCurrent ? colors.bgElevated : colors.bgSurface,
                    }}
                  >
                    <Text
                      style={{
                        color: isCurrent ? colors.brandPrimary : colors.textSecondary,
                        fontSize: 11,
                        fontWeight: '800',
                      }}
                    >
                      {deal.code} ({deal.badgeText})
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Manual Input Row */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Input
                  placeholder="Enter code (MELB15, FLAME10, FREEDEL)"
                  value={promoInput}
                  onChangeText={setPromoInput}
                  autoCapitalize="characters"
                />
              </View>
              <Button variant="outline" size="md" onPress={handleApplyPromoInput}>
                Apply
              </Button>
            </View>

            {totals.promoError ? (
              <Text style={{ color: colors.statusDanger, fontSize: 11, fontWeight: '700' }}>
                {totals.promoError}
              </Text>
            ) : null}

            {totals.appliedPromo ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    color: colors.statusSuccess,
                    fontSize: 11,
                    fontWeight: '700',
                  }}
                >
                  ✓ {totals.appliedPromo.code}: {totals.appliedPromo.title}
                </Text>
                <Pressable onPress={() => dispatch(applyPromoCode(null))}>
                  <Text
                    style={{
                      color: colors.textMuted,
                      fontSize: 11,
                      fontWeight: '700',
                    }}
                  >
                    Remove
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>
      )}
    </BottomSheetModal>
  );
}

