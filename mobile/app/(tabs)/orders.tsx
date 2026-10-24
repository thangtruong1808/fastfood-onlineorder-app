import { useRouter } from 'expo-router';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Gift,
  Heart,
  MapPin,
  Plus,
  Receipt,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Tag,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useToast } from '@/components/common/ToastProvider';
import { Badge } from '@/components/ui/Badge';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { MENU_ITEMS } from '@/data/menuSeed';
import { addCartItem, applyPromoCode, setCartDrawerOpen } from '@/features/cart/cartSlice';
import { ItemCard } from '@/features/menu/ItemCard';
import { ItemDetailSheet } from '@/features/menu/ItemDetailSheet';
import { TaxReceiptModal } from '@/features/orders/TaxReceiptModal';
import { setDeliveryDetails } from '@/features/stores/storeSlice';
import { useTheme } from '@/hooks/useTheme';
import { formatAUD } from '@/lib/currency';
import { formatMelbDate, formatMelbTime } from '@/lib/date';
import type { MenuItem, OrderRecord, SavedAddress } from '@/types';

type DashboardTab = 'orders' | 'loyalty' | 'favorites' | 'addresses';

const REWARD_VOUCHERS = [
  {
    id: 'rew-chips',
    title: 'Free Rosemary & Salt Chips',
    costPoints: 300,
    desc: 'Redeem on any burger or wrap order',
    code: 'MELB15',
  },
  {
    id: 'rew-thickshake',
    title: 'Free Hand-Spun Thickshake',
    costPoints: 400,
    desc: 'Lygon espresso, malt chocolate, or vanilla',
    code: 'MELB15',
  },
  {
    id: 'rew-voucher10',
    title: 'A$10.00 Off Family Feast',
    costPoints: 500,
    desc: 'Instant discount on orders over A$45',
    code: 'FLAME10',
  },
  {
    id: 'rew-freedel',
    title: 'Zero Melbourne Delivery Fee',
    costPoints: 650,
    desc: 'Waives suburb delivery fee on orders over A$20',
    code: 'FREEDEL',
  },
];

export default function OrdersAndRewardsTabScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { colors } = useTheme();
  const { showToast } = useToast();

  const { currentUser, favoriteItemIds } = useAppSelector((state) => state.auth);
  const orders = useAppSelector((state) => state.orders.orders);

  const [activeTab, setActiveTab] = useState<DashboardTab>('orders');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<OrderRecord | null>(null);
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);

  // Addresses state
  const [addresses, setAddresses] = useState<SavedAddress[]>(currentUser.savedAddresses);
  const [newAddressModalOpen, setNewAddressModalOpen] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrSuburb, setNewAddrSuburb] = useState('Fitzroy');
  const [newAddrPostcode, setNewAddrPostcode] = useState('3065');
  const [newAddrNotes, setNewAddrNotes] = useState('');

  const favoriteItems = MENU_ITEMS.filter((item) => favoriteItemIds.includes(item.id));

  // Loyalty Tier Progress Calculation
  const points = currentUser.loyaltyPoints;
  let nextTierName = 'Southern Gold';
  let tierProgressPercent = 100;
  let pointsToNext = 0;

  if (points < 500) {
    nextTierName = 'Silver Cross';
    tierProgressPercent = Math.min(100, Math.round((points / 500) * 100));
    pointsToNext = 500 - points;
  } else if (points < 1200) {
    nextTierName = 'Southern Gold';
    tierProgressPercent = Math.min(100, Math.round(((points - 500) / 700) * 100));
    pointsToNext = 1200 - points;
  }

  // 1-Tap Reorder Action
  const handleReorder = (order: OrderRecord) => {
    order.items.forEach((item) => {
      dispatch(addCartItem(item));
    });

    showToast({
      title: `Added ${order.items.length} items from Order #${order.orderNumber}!`,
      description: 'Your bag has been populated with your previous selections.',
      tone: 'success',
    });

    dispatch(setCartDrawerOpen(true));
  };

  const handleRedeemVoucher = (voucher: (typeof REWARD_VOUCHERS)[0]) => {
    if (currentUser.loyaltyPoints < voucher.costPoints) {
      showToast({
        title: 'Insufficient Flame Points',
        description: `Need ${voucher.costPoints} pts (You have ${currentUser.loyaltyPoints} pts).`,
        tone: 'error',
      });
      return;
    }

    dispatch(applyPromoCode(voucher.code));
    showToast({
      title: `Reward Redeemed (${voucher.code})!`,
      description: `${voucher.title} applied to your active order bag.`,
      tone: 'success',
    });
  };

  const handleSetDefaultAddress = (addr: SavedAddress) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === addr.id,
      })),
    );
    dispatch(
      setDeliveryDetails({
        address: addr.street,
        suburb: addr.suburb,
        postcode: addr.postcode,
      }),
    );
    showToast({
      title: `Default Delivery Set: ${addr.label}`,
      description: `${addr.street}, ${addr.suburb} VIC ${addr.postcode}`,
      tone: 'success',
    });
  };

  const handleSaveNewAddress = () => {
    if (!newAddrStreet.trim()) {
      showToast({
        title: 'Street address required',
        tone: 'error',
      });
      return;
    }

    const newAddr: SavedAddress = {
      id: `addr-${Date.now()}`,
      label: newAddrLabel.trim() || 'Melbourne Address',
      street: newAddrStreet.trim(),
      suburb: newAddrSuburb.trim() || 'Melbourne',
      postcode: newAddrPostcode.trim() || '3000',
      deliveryNotes: newAddrNotes.trim() || undefined,
      isDefault: addresses.length === 0,
    };

    setAddresses((prev) => [...prev, newAddr]);
    setNewAddressModalOpen(false);
    setNewAddrLabel('');
    setNewAddrStreet('');
    setNewAddrNotes('');

    showToast({
      title: 'Melbourne delivery address saved!',
      description: `${newAddr.street}, ${newAddr.suburb} VIC ${newAddr.postcode}`,
      tone: 'success',
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 18 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Customer Hero Profile Header */}
        <View
          style={{
            borderRadius: 24,
            backgroundColor: '#1F1714',
            padding: 20,
            gap: 14,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <View
                style={{
                  height: 52,
                  width: 52,
                  borderRadius: 16,
                  backgroundColor: colors.brandPrimary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '900' }}>
                  {currentUser.avatarInitials || 'AM'}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 19, fontWeight: '900' }}>
                    {currentUser.name}
                  </Text>
                  <Badge tone="amber">{currentUser.loyaltyTier}</Badge>
                </View>
                <Text
                  numberOfLines={1}
                  style={{ color: 'rgba(254, 243, 199, 0.78)', fontSize: 12, marginTop: 2 }}
                >
                  {currentUser.email || 'Guest Session'} • Since {currentUser.memberSince}
                </Text>
              </View>
            </View>
          </View>

          {/* Flame Balance & Switch Persona Row */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderColor: 'rgba(255, 255, 255, 0.14)',
              borderWidth: 1,
              borderRadius: 16,
              padding: 12,
            }}
          >
            <View>
              <Text
                style={{
                  color: '#FCD34D',
                  fontSize: 10,
                  fontWeight: '800',
                  textTransform: 'uppercase',
                }}
              >
                Flame Rewards Balance
              </Text>
              <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '900', marginTop: 2 }}>
                {currentUser.loyaltyPoints.toLocaleString()} pts
              </Text>
            </View>

            <Button
              variant="outline"
              size="sm"
              onPress={() => router.push('/(tabs)/more')}
            >
              Switch Persona
            </Button>
          </View>
        </View>

        {/* 4 Sub-Tab Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {[
            { id: 'orders' as const, label: `Orders (${orders.length})`, Icon: Clock },
            { id: 'loyalty' as const, label: 'Flame Rewards', Icon: Sparkles },
            { id: 'favorites' as const, label: `Favorites (${favoriteItems.length})`, Icon: Heart },
            { id: 'addresses' as const, label: `Addresses (${addresses.length})`, Icon: MapPin },
          ].map((tab) => {
            const Icon = tab.Icon;
            const isActive = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 14,
                  backgroundColor: isActive ? colors.brandPrimary : colors.bgSurface,
                  borderWidth: 1,
                  borderColor: isActive ? colors.brandPrimary : colors.borderSubtle,
                }}
              >
                <Icon
                  size={15}
                  color={isActive ? '#FFFFFF' : colors.textSecondary}
                />
                <Text
                  style={{
                    color: isActive ? '#FFFFFF' : colors.textPrimary,
                    fontSize: 12,
                    fontWeight: '800',
                  }}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* TAB 1: ORDER HISTORY */}
        {activeTab === 'orders' ? (
          <View style={{ gap: 12 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View>
                <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '900' }}>
                  Your Melbourne Orders
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  Track live progress, inspect tax invoices, or reorder in 1 tap
                </Text>
              </View>
            </View>

            {orders.length === 0 ? (
              <EmptyState
                icon={<ShoppingBag size={28} color={colors.brandPrimary} />}
                title="No Orders Yet"
                description="Place your first flame-grilled order to track live kitchen stages and earn Flame Points."
                actionLabel="Browse Melbourne Menu"
                onAction={() => router.push('/(tabs)/menu')}
              />
            ) : (
              orders.map((order) => (
                <Card key={order.id} style={{ gap: 12 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Badge tone="brand">#{order.orderNumber}</Badge>
                      <Badge
                        tone={
                          order.status === 'completed'
                            ? 'success'
                            : order.status === 'ready_or_out'
                              ? 'amber'
                              : 'info'
                        }
                      >
                        {order.status.toUpperCase()}
                      </Badge>
                    </View>
                    <Text
                      style={{
                        color: colors.brandPrimary,
                        fontSize: 16,
                        fontWeight: '900',
                      }}
                    >
                      {formatAUD(order.total)}
                    </Text>
                  </View>

                  <View style={{ gap: 2 }}>
                    <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '800' }}>
                      {order.storeName}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                      {formatMelbDate(order.createdAt)} at {formatMelbTime(order.createdAt)} •{' '}
                      {order.fulfillmentMode.toUpperCase()}
                    </Text>
                  </View>

                  {/* Items Preview */}
                  <View
                    style={{
                      backgroundColor: colors.bgElevated,
                      borderRadius: 12,
                      padding: 10,
                      gap: 4,
                    }}
                  >
                    {order.items.map((item) => (
                      <Text
                        key={item.cartItemId}
                        numberOfLines={1}
                        style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '600' }}
                      >
                        • {item.quantity}x {item.name} ({item.customization.sizeLabel})
                      </Text>
                    ))}
                  </View>

                  {/* Action Buttons */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<RotateCcw size={13} color="#FFFFFF" />}
                      onPress={() => handleReorder(order)}
                    >
                      1-Tap Reorder
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      rightIcon={<ArrowRight size={13} color={colors.textPrimary} />}
                      onPress={() => router.push(`/tracking/${order.id}`)}
                    >
                      Track Live
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Receipt size={13} color={colors.textSecondary} />}
                      onPress={() => setSelectedReceiptOrder(order)}
                    >
                      Tax Invoice
                    </Button>
                  </View>
                </Card>
              ))
            )}
          </View>
        ) : null}

        {/* TAB 2: FLAME REWARDS & VOUCHERS */}
        {activeTab === 'loyalty' ? (
          <View style={{ gap: 14 }}>
            <Card style={{ gap: 12 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={18} color={colors.brandSecondary} />
                  <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '900' }}>
                    Tier Progress: {currentUser.loyaltyTier}
                  </Text>
                </View>
                <Badge tone="amber">{points} pts</Badge>
              </View>

              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                {points >= 1200
                  ? 'You have unlocked our highest tier: Southern Gold Member! Earn 10 pts per A$1 spent.'
                  : `${pointsToNext} more Flame Points to unlock ${nextTierName} tier.`}
              </Text>

              {/* Progress Bar */}
              <View
                style={{
                  height: 10,
                  borderRadius: 999,
                  backgroundColor: colors.bgMuted,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${tierProgressPercent}%`,
                    backgroundColor: colors.brandSecondary,
                  }}
                />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '700' }}>
                  Bronze Star (0)
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '700' }}>
                  Silver Cross (500)
                </Text>
                <Text style={{ color: colors.brandSecondary, fontSize: 10, fontWeight: '800' }}>
                  Southern Gold (1,200+)
                </Text>
              </View>
            </Card>

            <Text style={{ color: colors.textPrimary, fontSize: 17, fontWeight: '900' }}>
              Redeem Flame Vouchers
            </Text>

            {REWARD_VOUCHERS.map((voucher) => {
              const canAfford = points >= voucher.costPoints;
              return (
                <Card key={voucher.id} style={{ gap: 10 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                      <View
                        style={{
                          height: 38,
                          width: 38,
                          borderRadius: 11,
                          backgroundColor: colors.bgElevated,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Gift size={18} color={colors.brandPrimary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: colors.textPrimary,
                            fontSize: 14,
                            fontWeight: '800',
                          }}
                        >
                          {voucher.title}
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                          {voucher.desc}
                        </Text>
                      </View>
                    </View>

                    <Badge tone={canAfford ? 'amber' : 'default'}>
                      {voucher.costPoints} pts
                    </Badge>
                  </View>

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
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Tag size={12} color={colors.textMuted} />
                      <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700' }}>
                        Code: {voucher.code}
                      </Text>
                    </View>
                    <Button
                      variant={canAfford ? 'primary' : 'outline'}
                      size="sm"
                      disabled={!canAfford}
                      onPress={() => handleRedeemVoucher(voucher)}
                    >
                      {canAfford ? 'Redeem & Apply' : 'Locked'}
                    </Button>
                  </View>
                </Card>
              );
            })}
          </View>
        ) : null}

        {/* TAB 3: SAVED FAVORITES */}
        {activeTab === 'favorites' ? (
          <View style={{ gap: 14 }}>
            <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '900' }}>
              Saved Melbourne Favorites ({favoriteItems.length})
            </Text>

            {favoriteItems.length === 0 ? (
              <EmptyState
                icon={<Heart size={28} color={colors.brandPrimary} />}
                title="No Saved Favorites Yet"
                description="Tap the heart icon on any burger, chicken tender, or shake to save it here for quick ordering."
                actionLabel="Explore Menu"
                onAction={() => router.push('/(tabs)/menu')}
              />
            ) : (
              favoriteItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onOpenCustomization={(chosen) => setSelectedItemForModal(chosen)}
                />
              ))
            )}
          </View>
        ) : null}

        {/* TAB 4: MELBOURNE ADDRESSES */}
        {activeTab === 'addresses' ? (
          <View style={{ gap: 12 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View>
                <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '900' }}>
                  Saved Victorian Addresses
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  Manage drop-off locations for Melbourne courier delivery
                </Text>
              </View>

              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus size={14} color="#FFFFFF" />}
                onPress={() => setNewAddressModalOpen(true)}
              >
                Add New
              </Button>
            </View>

            {addresses.length === 0 ? (
              <EmptyState
                icon={<MapPin size={28} color={colors.brandPrimary} />}
                title="No Saved Addresses"
                description="Add your Melbourne home or office address for faster checkout."
                actionLabel="Add Address"
                onAction={() => setNewAddressModalOpen(true)}
              />
            ) : (
              addresses.map((addr) => (
                <Card key={addr.id} style={{ gap: 8 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <MapPin size={15} color={colors.brandPrimary} />
                      <Text
                        style={{
                          color: colors.textPrimary,
                          fontSize: 15,
                          fontWeight: '800',
                        }}
                      >
                        {addr.label}
                      </Text>
                    </View>
                    {addr.isDefault ? (
                      <Badge tone="success">
                        <CheckCircle2 size={11} color={colors.statusSuccess} />
                        <Text
                          style={{
                            color: colors.statusSuccess,
                            fontSize: 10,
                            fontWeight: '800',
                          }}
                        >
                          Default
                        </Text>
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onPress={() => handleSetDefaultAddress(addr)}
                      >
                        Use for Delivery
                      </Button>
                    )}
                  </View>

                  <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '600' }}>
                    {addr.street}, {addr.suburb} VIC {addr.postcode}
                  </Text>

                  {addr.deliveryNotes ? (
                    <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                      Note: {addr.deliveryNotes}
                    </Text>
                  ) : null}
                </Card>
              ))
            )}
          </View>
        ) : null}
      </ScrollView>

      {/* Add New Melbourne Address Modal Sheet */}
      <BottomSheetModal
        open={newAddressModalOpen}
        onOpenChange={setNewAddressModalOpen}
        title="Add Melbourne Address"
        subtitle="Save a Victorian suburb address for fast delivery"
        footer={
          <Button variant="primary" size="lg" fullWidth onPress={handleSaveNewAddress}>
            Save Melbourne Address
          </Button>
        }
      >
        <View style={{ gap: 12 }}>
          <Input
            label="Address Label"
            value={newAddrLabel}
            onChangeText={setNewAddrLabel}
            placeholder="e.g. Home • Fitzroy Loft"
          />
          <Input
            label="Street Address"
            value={newAddrStreet}
            onChangeText={setNewAddrStreet}
            placeholder="e.g. 42 Napier Street, Apt 3B"
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 2 }}>
              <Input
                label="Melbourne Suburb"
                value={newAddrSuburb}
                onChangeText={setNewAddrSuburb}
                placeholder="Fitzroy"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Postcode"
                value={newAddrPostcode}
                onChangeText={setNewAddrPostcode}
                keyboardType="number-pad"
                placeholder="3065"
              />
            </View>
          </View>
          <Input
            label="Delivery Instructions (Optional)"
            value={newAddrNotes}
            onChangeText={setNewAddrNotes}
            placeholder="e.g. Buzz #302 at timber gate"
          />
        </View>
      </BottomSheetModal>

      {/* Tax Invoice Modal */}
      <TaxReceiptModal
        order={selectedReceiptOrder}
        open={Boolean(selectedReceiptOrder)}
        onOpenChange={(open) => {
          if (!open) setSelectedReceiptOrder(null);
        }}
      />

      {/* Item Customization Modal (from Favorites Tab) */}
      <ItemDetailSheet
        item={selectedItemForModal}
        open={Boolean(selectedItemForModal)}
        onOpenChange={(open) => {
          if (!open) setSelectedItemForModal(null);
        }}
      />
    </View>
  );
}
