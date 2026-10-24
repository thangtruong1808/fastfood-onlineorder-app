import {
  Clock,
  Flame,
  Heart,
  Plus,
  SlidersHorizontal,
  Star,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useToast } from '@/components/common/ToastProvider';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { toggleFavoriteItem } from '@/features/auth-mock/authSlice';
import { addCartItem } from '@/features/cart/cartSlice';
import { useTheme } from '@/hooks/useTheme';
import { formatAUD } from '@/lib/currency';
import type { MenuItem } from '@/types';

export interface ItemCardProps {
  item: MenuItem;
  onOpenCustomization: (item: MenuItem) => void;
}

export function ItemCard({ item, onOpenCustomization }: ItemCardProps) {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { showToast } = useToast();

  const favoriteIds = useAppSelector((state) => state.auth.favoriteItemIds);
  const isFavorite = favoriteIds.includes(item.id);
  const [imgError, setImgError] = useState(false);

  const handleToggleFavorite = () => {
    dispatch(toggleFavoriteItem(item.id));
    showToast({
      title: isFavorite
        ? `Removed ${item.name} from favorites`
        : `Saved ${item.name} to favorites!`,
      tone: 'info',
    });
  };

  const handleQuickAdd = () => {
    const regularSize = item.sizeOptions[0] ?? {
      id: 'regular' as const,
      label: 'Regular',
      priceDelta: 0,
      caloriesDelta: 0,
    };

    dispatch(
      addCartItem({
        cartItemId: `${item.id}-regular-single`,
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
      }),
    );

    showToast({
      title: `Added ${item.name} to bag`,
      description: `${formatAUD(item.basePrice)} • ${regularSize.label} (incl. 10% GST)`,
      tone: 'success',
    });
  };

  return (
    <Card
      interactive
      onPress={() => onOpenCustomization(item)}
      style={{ padding: 14, gap: 12 }}
    >
      {/* Dish Image Container */}
      <View
        style={{
          height: 176,
          width: '100%',
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: '#1F1714',
          position: 'relative',
        }}
      >
        {!imgError ? (
          <Image
            source={{ uri: item.imageUrl }}
            onError={() => setImgError(true)}
            resizeMode="cover"
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              backgroundColor: '#2A1812',
              gap: 6,
            }}
          >
            <Flame size={28} color="#FBBF24" />
            <Text
              numberOfLines={1}
              style={{
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: '800',
                textAlign: 'center',
              }}
            >
              {item.name}
            </Text>
          </View>
        )}

        {/* Top Left Feature / Popular / New Badges */}
        <View
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 6,
          }}
        >
          {item.isFeatured ? (
            <View
              style={{
                backgroundColor: colors.brandPrimary,
                paddingHorizontal: 9,
                paddingVertical: 4,
                borderRadius: 999,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>
                Chef Special
              </Text>
            </View>
          ) : null}

          {item.isPopular ? (
            <View
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.76)',
                borderColor: 'rgba(251, 191, 36, 0.4)',
                borderWidth: 1,
                paddingHorizontal: 9,
                paddingVertical: 4,
                borderRadius: 999,
              }}
            >
              <Text style={{ color: '#FCD34D', fontSize: 10, fontWeight: '800' }}>
                Popular
              </Text>
            </View>
          ) : null}

          {item.isNew ? (
            <View
              style={{
                backgroundColor: colors.statusInfo,
                paddingHorizontal: 9,
                paddingVertical: 4,
                borderRadius: 999,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>
                New
              </Text>
            </View>
          ) : null}
        </View>

        {/* Top Right Favorite Heart Button */}
        <Pressable
          onPress={handleToggleFavorite}
          accessibilityRole="button"
          accessibilityLabel={
            isFavorite
              ? `Remove ${item.name} from favorites`
              : `Save ${item.name} to favorites`
          }
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            height: 34,
            width: 34,
            borderRadius: 17,
            backgroundColor: isFavorite ? '#F43F5E' : 'rgba(0, 0, 0, 0.55)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Heart
            size={16}
            color="#FFFFFF"
            fill={isFavorite ? '#FFFFFF' : 'transparent'}
          />
        </Pressable>

        {/* Bottom Overlay: Rating & Prep Time */}
        <View
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            right: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: 'rgba(0, 0, 0, 0.72)',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <Star size={12} color="#FCD34D" fill="#FCD34D" />
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>
              {item.rating.toFixed(1)}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>
              ({item.reviewCount})
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: 'rgba(0, 0, 0, 0.72)',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <Clock size={12} color="#F87171" />
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>
              ~{item.prepTimeMinutes}m
            </Text>
          </View>
        </View>
      </View>

      {/* Dietary & Energy Strip */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
        <View
          style={{
            backgroundColor: colors.bgElevated,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
          }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '800' }}>
            {item.nutrition.calories} kcal
          </Text>
        </View>

        {item.dietaryTags.slice(0, 3).map((tag) => (
          <Badge key={tag} tone="success">
            {tag}
          </Badge>
        ))}
      </View>

      {/* Title & Short Description */}
      <View style={{ gap: 4 }}>
        <Text
          numberOfLines={1}
          style={{
            color: colors.textPrimary,
            fontSize: 16,
            fontWeight: '900',
          }}
        >
          {item.name}
        </Text>
        <Text
          numberOfLines={2}
          style={{
            color: colors.textSecondary,
            fontSize: 12,
            lineHeight: 17,
          }}
        >
          {item.shortDescription}
        </Text>
      </View>

      {/* Footer: Price & Customize / Quick Add Buttons */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: colors.borderSubtle,
        }}
      >
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text
              style={{
                color: colors.brandPrimary,
                fontSize: 17,
                fontWeight: '900',
              }}
            >
              {formatAUD(item.basePrice)}
            </Text>
            {item.originalPrice ? (
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 12,
                  textDecorationLine: 'line-through',
                }}
              >
                {formatAUD(item.originalPrice)}
              </Text>
            ) : null}
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 10 }}>
            AUD • incl. 10% GST
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable
            onPress={() => onOpenCustomization(item)}
            accessibilityRole="button"
            accessibilityLabel={`Customize ${item.name}`}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              paddingHorizontal: 11,
              paddingVertical: 8,
              borderRadius: 11,
              borderWidth: 1,
              borderColor: colors.borderStrong,
              backgroundColor: colors.bgElevated,
            }}
          >
            <SlidersHorizontal size={13} color={colors.textPrimary} />
            <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '700' }}>
              Options
            </Text>
          </Pressable>

          <Pressable
            onPress={handleQuickAdd}
            accessibilityRole="button"
            accessibilityLabel={`Quick add ${item.name} to bag`}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 13,
              paddingVertical: 8,
              borderRadius: 11,
              backgroundColor: colors.brandPrimary,
            }}
          >
            <Plus size={14} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '800' }}>
              Add
            </Text>
          </Pressable>
        </View>
      </View>
    </Card>
  );
}

