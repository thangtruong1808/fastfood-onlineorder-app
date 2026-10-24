import { ShoppingBag } from 'lucide-react-native';
import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { calculateCartTotals } from '@/features/cart/cartSelectors';
import { setCartDrawerOpen } from '@/features/cart/cartSlice';
import { useTheme } from '@/hooks/useTheme';
import { formatAUD } from '@/lib/currency';

export function StickyCartBar() {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();

  const { items, promoCode } = useAppSelector((state) => state.cart);
  const { fulfillmentMode, selectedStoreId } = useAppSelector((state) => state.store);

  const totals = calculateCartTotals({
    items,
    promoCode,
    fulfillmentMode,
    selectedStoreId,
  });

  if (totals.itemsCount <= 0) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 14,
        right: 14,
        bottom: Platform.OS === 'ios' ? 92 : 72,
        zIndex: 40,
      }}
    >
      <Pressable
        onPress={() => dispatch(setCartDrawerOpen(true))}
        accessibilityRole="button"
        accessibilityLabel={`View order bag with ${totals.itemsCount} items`}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.brandPrimary,
          borderRadius: 18,
          paddingHorizontal: 16,
          paddingVertical: 13,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 6,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              height: 28,
              minWidth: 28,
              borderRadius: 14,
              backgroundColor: 'rgba(255, 255, 255, 0.22)',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 6,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '900' }}>
              {totals.itemsCount}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <ShoppingBag size={15} color="#FFFFFF" />
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: '800',
                letterSpacing: 0.4,
                textTransform: 'uppercase',
              }}
            >
              View Order Bag
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '900' }}>
            {formatAUD(totals.total)}
          </Text>
          <Text style={{ color: 'rgba(254, 243, 199, 0.85)', fontSize: 10 }}>
            incl. GST
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

