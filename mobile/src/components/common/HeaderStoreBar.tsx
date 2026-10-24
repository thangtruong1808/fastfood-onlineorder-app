import {
  Bike,
  ChevronDown,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Store as StoreIcon,
  User,
} from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setSimulatorExpanded } from '@/app/simulatorSlice';
import { BrandLogo } from '@/components/common/BrandLogo';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useToast } from '@/components/common/ToastProvider';
import { Badge } from '@/components/ui/Badge';
import { MELBOURNE_STORES } from '@/data/storesSeed';
import { switchDemoRole } from '@/features/auth-mock/authSlice';
import { setCartDrawerOpen } from '@/features/cart/cartSlice';
import { setStoreModalOpen } from '@/features/stores/storeSlice';
import { useTheme } from '@/hooks/useTheme';
import { formatAUD } from '@/lib/currency';
import { FULFILLMENT_MODES } from '@/types';

export function HeaderStoreBar() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { showToast } = useToast();

  const { selectedStoreId, fulfillmentMode, deliverySuburb } = useAppSelector(
    (state) => state.store,
  );
  const { currentUser } = useAppSelector((state) => state.auth);
  const cartItems = useAppSelector((state) => state.cart.items);
  const { apiLatencyMs, forceNextApiError } = useAppSelector(
    (state) => state.simulator,
  );

  const activeStore =
    MELBOURNE_STORES.find((s) => s.id === selectedStoreId) ?? MELBOURNE_STORES[0];

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  const handleToggleRole = () => {
    const nextRole = currentUser.role === 'admin' ? 'customer' : 'admin';
    dispatch(switchDemoRole(nextRole));
    showToast({
      title: `Switched to ${nextRole === 'admin' ? 'Admin (Sarah Chen)' : 'Customer (Alex Mercer)'}`,
      description:
        nextRole === 'admin'
          ? 'Unlocked Melbourne Store Analytics & Kitchen Feed'
          : 'Viewing as Southern Gold loyalty member',
      tone: 'success',
    });
  };

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: colors.bgSurface,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderSubtle,
      }}
    >
      {/* Top Row: Brand Logo, Theme Toggle, Simulator & Bag Trigger */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 14,
          paddingVertical: 10,
          gap: 8,
        }}
      >
        <BrandLogo compact />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <ThemeToggle compact />

          {/* API Simulator Quick Trigger */}
          <Pressable
            onPress={() => dispatch(setSimulatorExpanded(true))}
            accessibilityRole="button"
            accessibilityLabel="Open RTK Query API simulator"
            style={{
              height: 34,
              paddingHorizontal: 8,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: forceNextApiError ? colors.statusDanger : colors.borderStrong,
              backgroundColor: colors.bgElevated,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Sliders size={13} color={ colors.brandPrimary } />
            <Text
              style={{
                fontSize: 10,
                fontWeight: '800',
                color: forceNextApiError ? colors.statusDanger : colors.textPrimary,
              }}
            >
              {forceNextApiError ? '503' : `${apiLatencyMs}ms`}
            </Text>
          </Pressable>

          {/* Bag Trigger Pill */}
          <Pressable
            onPress={() => dispatch(setCartDrawerOpen(true))}
            accessibilityRole="button"
            accessibilityLabel={`Open order bag with ${totalItems} items`}
            style={{
              height: 36,
              paddingHorizontal: 10,
              borderRadius: 11,
              backgroundColor: colors.brandPrimary,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <ShoppingBag size={14} color="#FFFFFF" />
            {totalItems > 0 ? (
              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>
                {formatAUD(cartSubtotal)}
              </Text>
            ) : null}
            <View
              style={{
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: 'rgba(255, 255, 255, 0.22)',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 4,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '900' }}>
                {totalItems}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      {/* Bottom Strip: Melbourne Kitchen & Fulfillment Selector + 1-Tap Role Pill */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 14,
          paddingVertical: 8,
          backgroundColor: colors.bgElevated,
          borderTopWidth: 1,
          borderTopColor: colors.borderSubtle,
          gap: 8,
        }}
      >
        <Pressable
          onPress={() => dispatch(setStoreModalOpen(true))}
          accessibilityRole="button"
          accessibilityLabel="Change Melbourne kitchen and fulfillment mode"
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {fulfillmentMode === FULFILLMENT_MODES.PICKUP ? (
            <StoreIcon size={14} color={colors.brandPrimary} />
          ) : (
            <Bike size={14} color={colors.brandPrimary} />
          )}

          <Text
            numberOfLines={1}
            style={{
              flexShrink: 1,
              color: colors.textPrimary,
              fontSize: 12,
              fontWeight: '700',
            }}
          >
            {fulfillmentMode === FULFILLMENT_MODES.PICKUP
              ? `Pickup: ${activeStore.suburb} (~${activeStore.pickupEtaMinutes}m)`
              : `Deliver to ${deliverySuburb} (~${activeStore.deliveryEtaMinutes}m)`}
          </Text>
          <MapPin size={12} color={colors.textMuted} />
          <ChevronDown size={14} color={colors.textMuted} />
        </Pressable>

        {/* 1-Tap Persona Switcher */}
        <Pressable
          onPress={handleToggleRole}
          accessibilityRole="button"
          accessibilityLabel="Switch demo role between Customer and Admin"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: colors.bgSurface,
            borderColor: colors.borderStrong,
            borderWidth: 1,
            borderRadius: 999,
            paddingHorizontal: 9,
            paddingVertical: 4,
          }}
        >
          {currentUser.role === 'admin' ? (
            <ShieldCheck size={12} color={colors.brandSecondary} />
          ) : (
            <User size={12} color={colors.brandPrimary} />
          )}
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 11,
              fontWeight: '700',
            }}
          >
            {currentUser.name.split(' ')[0]}
          </Text>
          <Badge tone={currentUser.role === 'admin' ? 'amber' : 'brand'}>
            {currentUser.role === 'admin' ? 'Admin' : 'Gold'}
          </Badge>
        </Pressable>
      </View>
    </View>
  );
}

