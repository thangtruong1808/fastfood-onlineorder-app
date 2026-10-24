import { useRouter } from 'expo-router';
import {
  ArrowRight,
  Award,
  Bike,
  Coffee,
  Cookie,
  CupSoda,
  Flame,
  Leaf,
  Sandwich,
  ShieldCheck,
  Smile,
  Sparkles,
  Store as StoreIcon,
  TicketPercent,
  Utensils,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useToast } from '@/components/common/ToastProvider';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { MELBOURNE_STORES } from '@/data/storesSeed';
import { applyPromoCode } from '@/features/cart/cartSlice';
import { ItemCard } from '@/features/menu/ItemCard';
import { ItemDetailSheet } from '@/features/menu/ItemDetailSheet';
import { setStoreModalOpen } from '@/features/stores/storeSlice';
import { useTheme } from '@/hooks/useTheme';
import { formatAUD } from '@/lib/currency';
import {
  useGetCategoriesQuery,
  useGetMenuItemsQuery,
  useGetPromoDealsQuery,
} from '@/services/mockApi';
import { FULFILLMENT_MODES, type MenuCategoryId, type MenuItem } from '@/types';

const CATEGORY_ICONS: Record<MenuCategoryId, typeof Flame> = {
  burgers: Flame,
  chicken: Sparkles,
  wraps: Sandwich,
  sides: Utensils,
  drinks: CupSoda,
  desserts: Cookie,
  breakfast: Coffee,
  kids: Smile,
  combos: Award,
};

export default function HomeTabScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { colors } = useTheme();
  const { showToast } = useToast();

  const { selectedStoreId, fulfillmentMode, deliverySuburb } = useAppSelector(
    (state) => state.store,
  );
  const activePromoCode = useAppSelector((state) => state.cart.promoCode);
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);

  const activeStore =
    MELBOURNE_STORES.find((s) => s.id === selectedStoreId) ?? MELBOURNE_STORES[0];

  const {
    data: menuItems,
    isLoading: isMenuLoading,
    isError: isMenuError,
    refetch: refetchMenu,
  } = useGetMenuItemsQuery();
  const { data: categories } = useGetCategoriesQuery();
  const { data: promoDeals } = useGetPromoDealsQuery();

  const featuredItems = (menuItems ?? []).filter((item) => item.isFeatured).slice(0, 6);
  const signatureItem = (menuItems ?? []).find(
    (item) => item.id === 'itm-southern-cross-signature',
  );

  const handleApplyPromo = (code: string) => {
    dispatch(applyPromoCode(code));
    showToast({
      title: `Promo code ${code} applied!`,
      description: 'Discount will be calculated automatically in your order bag.',
      tone: 'success',
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Flame-Grilled Melbourne Hero Banner */}
        <View
          style={{
            borderRadius: 24,
            backgroundColor: '#1F1714',
            borderWidth: 1,
            borderColor: colors.borderSubtle,
            padding: 20,
            gap: 14,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'flex-start',
              gap: 6,
              backgroundColor: 'rgba(245, 158, 11, 0.16)',
              borderColor: 'rgba(251, 191, 36, 0.35)',
              borderWidth: 1,
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Flame size={13} color="#FBBF24" />
            <Text
              style={{
                color: '#FCD34D',
                fontSize: 10,
                fontWeight: '800',
                letterSpacing: 0.5,
              }}
            >
              FLAME-GRILLED UNDER THE SOUTHERN CROSS • MELBOURNE
            </Text>
          </View>

          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 27,
              fontWeight: '900',
              lineHeight: 33,
            }}
          >
            Gippsland Grass-Fed Smash & Crispy Free-Range Chicken.
          </Text>

          <Text
            style={{
              color: 'rgba(254, 243, 199, 0.85)',
              fontSize: 13,
              lineHeight: 19,
            }}
          >
            Seared to order over ironbark charcoal across 8 Melbourne kitchens—from
            Flinders Quarter to Brunswick Street. Hot, crisp, and ready in minutes.
          </Text>

          {/* Live Melbourne Store Pill inside Hero */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              borderWidth: 1,
              borderRadius: 16,
              padding: 12,
              gap: 10,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <View
                style={{
                  height: 38,
                  width: 38,
                  borderRadius: 11,
                  backgroundColor: colors.brandPrimary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {fulfillmentMode === FULFILLMENT_MODES.PICKUP ? (
                  <StoreIcon size={18} color="#FFFFFF" />
                ) : (
                  <Bike size={18} color="#FFFFFF" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: '#FCD34D',
                    fontSize: 10,
                    fontWeight: '800',
                    textTransform: 'uppercase',
                  }}
                >
                  {fulfillmentMode === FULFILLMENT_MODES.PICKUP
                    ? `Click & Collect • Ready in ~${activeStore.pickupEtaMinutes} mins`
                    : `Delivering to ${deliverySuburb} • ~${activeStore.deliveryEtaMinutes} mins`}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: '700',
                    marginTop: 2,
                  }}
                >
                  {activeStore.name}
                </Text>
              </View>
            </View>

            <Button
              variant="outline"
              size="sm"
              onPress={() => dispatch(setStoreModalOpen(true))}
            >
              Change
            </Button>
          </View>

          {/* Hero CTAs */}
          <View style={{ gap: 10, paddingTop: 2 }}>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              rightIcon={<ArrowRight size={16} color="#FFFFFF" />}
              onPress={() => router.push('/(tabs)/menu')}
            >
              Explore Full Melbourne Menu
            </Button>

            <Button
              variant="secondary"
              size="md"
              fullWidth
              leftIcon={<TicketPercent size={15} color="#FFFFFF" />}
              onPress={() => handleApplyPromo('MELB15')}
            >
              {activePromoCode === 'MELB15'
                ? 'MELB15 Applied (15% Off A$25+)'
                : 'Claim 15% Off Code: MELB15'}
            </Button>
          </View>
        </View>

        {/* 2. Browse by Category Shortcuts */}
        <View style={{ gap: 12 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View>
              <Text style={{ color: colors.textPrimary, fontSize: 19, fontWeight: '900' }}>
                Explore by Category
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                Tap any category to filter the Melbourne kitchen menu
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/(tabs)/menu')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Text
                style={{
                  color: colors.brandPrimary,
                  fontSize: 12,
                  fontWeight: '800',
                }}
              >
                View All
              </Text>
              <ArrowRight size={13} color={colors.brandPrimary} />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10 }}
          >
            {(categories ?? []).map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id] ?? Flame;
              return (
                <Card
                  key={cat.id}
                  interactive
                  onPress={() =>
                    router.push({
                      pathname: '/(tabs)/menu',
                      params: { category: cat.id },
                    })
                  }
                  style={{ width: 152, padding: 13, gap: 8 }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View
                      style={{
                        height: 36,
                        width: 36,
                        borderRadius: 11,
                        backgroundColor: colors.bgElevated,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={18} color={cat.accentColor} />
                    </View>
                    {cat.badgeText ? (
                      <Badge tone="brand">{cat.badgeText}</Badge>
                    ) : null}
                  </View>

                  <View style={{ gap: 3 }}>
                    <Text
                      style={{
                        color: colors.textPrimary,
                        fontSize: 14,
                        fontWeight: '800',
                      }}
                    >
                      {cat.shortName}
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={{
                        color: colors.textSecondary,
                        fontSize: 11,
                        lineHeight: 15,
                      }}
                    >
                      {cat.description}
                    </Text>
                  </View>
                </Card>
              );
            })}
          </ScrollView>
        </View>

        {/* 3. Signature Spotlight Card */}
        {signatureItem ? (
          <Card
            interactive
            onPress={() => setSelectedItemForModal(signatureItem)}
            style={{
              backgroundColor: colors.bgElevated,
              borderColor: colors.brandPrimary,
              borderWidth: 1.5,
              padding: 16,
              gap: 12,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Badge tone="brand">Melbourne #1 Bestseller</Badge>
              <Badge tone="amber">46g Protein • 780 kcal</Badge>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <Image
                source={{ uri: signatureItem.imageUrl }}
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 16,
                  backgroundColor: '#1F1714',
                }}
              />
              <View style={{ flex: 1, gap: 4 }}>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 17,
                    fontWeight: '900',
                  }}
                >
                  {signatureItem.name}
                </Text>
                <Text
                  numberOfLines={2}
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    lineHeight: 17,
                  }}
                >
                  {signatureItem.shortDescription}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                  <Text
                    style={{
                      color: colors.brandPrimary,
                      fontSize: 16,
                      fontWeight: '900',
                    }}
                  >
                    {formatAUD(signatureItem.basePrice)}
                  </Text>
                  {signatureItem.originalPrice ? (
                    <Text
                      style={{
                        color: colors.textMuted,
                        fontSize: 12,
                        textDecorationLine: 'line-through',
                      }}
                    >
                      {formatAUD(signatureItem.originalPrice)}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>

            <Button
              variant="primary"
              size="md"
              fullWidth
              onPress={() => setSelectedItemForModal(signatureItem)}
            >
              Customize Signature Burger
            </Button>
          </Card>
        ) : null}

        {/* 4. Featured Melbourne Menu Items */}
        <View style={{ gap: 12 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ gap: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} color={colors.brandPrimary} />
                <Text style={{ color: colors.textPrimary, fontSize: 19, fontWeight: '900' }}>
                  Chef’s Featured Favorites
                </Text>
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                Tap any dish to customize size, combo meal, or toppings
              </Text>
            </View>
          </View>

          {isMenuLoading ? (
            <View style={{ gap: 14 }}>
              <Skeleton height={290} borderRadius={22} />
              <Skeleton height={290} borderRadius={22} />
            </View>
          ) : isMenuError ? (
            <ErrorState onRetry={refetchMenu} />
          ) : (
            <View style={{ gap: 14 }}>
              {featuredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onOpenCustomization={(chosen) => setSelectedItemForModal(chosen)}
                />
              ))}
            </View>
          )}
        </View>

        {/* 5. Melbourne Local Exclusive Promo Deals */}
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <TicketPercent size={17} color={colors.brandSecondary} />
            <Text style={{ color: colors.textPrimary, fontSize: 19, fontWeight: '900' }}>
              Melbourne Local Promo Deals
            </Text>
          </View>

          <View style={{ gap: 12 }}>
            {(promoDeals ?? []).map((deal) => {
              const isApplied = activePromoCode === deal.code;
              return (
                <Card key={deal.id} style={{ gap: 10 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Badge tone="brand">{deal.badgeText}</Badge>
                    <Text
                      style={{
                        color: colors.textMuted,
                        fontSize: 11,
                        fontWeight: '700',
                      }}
                    >
                      {deal.expiryText}
                    </Text>
                  </View>

                  <View style={{ gap: 3 }}>
                    <Text
                      style={{
                        color: colors.textPrimary,
                        fontSize: 16,
                        fontWeight: '900',
                      }}
                    >
                      {deal.title}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12, lineHeight: 18 }}>
                      {deal.description}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 6,
                      borderTopWidth: 1,
                      borderTopColor: colors.borderSubtle,
                    }}
                  >
                    <Badge tone="amber">Code: {deal.code}</Badge>
                    <Button
                      variant={isApplied ? 'outline' : 'primary'}
                      size="sm"
                      onPress={() => handleApplyPromo(deal.code)}
                    >
                      {isApplied ? '✓ Applied to Bag' : `Apply ${deal.code}`}
                    </Button>
                  </View>
                </Card>
              );
            })}
          </View>
        </View>

        {/* 6. Victorian Provenance & Quality Strip */}
        <View style={{ gap: 10 }}>
          {[
            {
              Icon: Flame,
              title: '100% Gippsland Grass-Fed Beef',
              desc: 'Hand-smashed daily over ironbark charcoal with zero fillers or preservatives.',
            },
            {
              Icon: Leaf,
              title: 'Victorian Produce & Plant-Forward Options',
              desc: 'Dedicated plant-based grill stations, vegan brioche buns, and Murray River salt chips.',
            },
            {
              Icon: ShieldCheck,
              title: 'Transparent AUD Pricing (10% GST Included)',
              desc: 'Every price includes Australian GST with full tax invoice receipts on every order.',
            },
          ].map(({ Icon, title, desc }) => (
            <Card key={title} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  height: 42,
                  width: 42,
                  borderRadius: 12,
                  backgroundColor: colors.bgElevated,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={20} color={colors.brandPrimary} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '800' }}>
                  {title}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11, lineHeight: 16 }}>
                  {desc}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* Item Customization Modal Sheet */}
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
