import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Star,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useAppDispatch } from '@/app/hooks';
import { useToast } from '@/components/common/ToastProvider';
import { Badge } from '@/components/ui/Badge';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { addCartItem } from '@/features/cart/cartSlice';
import { useTheme } from '@/hooks/useTheme';
import { formatAUD } from '@/lib/currency';
import type { AddOnModifier, CartItem, MenuItem, SizeOption } from '@/types';

export interface ItemDetailSheetProps {
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COMBO_DRINK_OPTIONS = [
  'Ironbark Classic Craft Cola',
  'Ironbark Zero Sugar Cola',
  'Lygon St Spicy Ginger Beer',
  'Tasmanian Sparkling Lemon Squash',
  'Victorian Mountain Mineral Water',
];

const COMBO_SIDE_OPTIONS = [
  'Rosemary & Murray Salt Chips (Reg)',
  'Sweet Potato Crisps with Herb Aioli',
  'Golden Ironbark Onion Rings',
  'Fresh Melbourne Crisp Slaw',
];

const STANDARD_REMOVALS = [
  'No Pickles',
  'No Red Onion',
  'No Fresh Tomato',
  'No Smoky Sauce',
  'No Mustard',
];

export function ItemDetailSheet({ item, open, onOpenChange }: ItemDetailSheetProps) {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { showToast } = useToast();

  const [selectedSizeId, setSelectedSizeId] = useState<'regular' | 'large' | 'king'>('regular');
  const [isCombo, setIsCombo] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState(COMBO_DRINK_OPTIONS[0]);
  const [selectedSide, setSelectedSide] = useState(COMBO_SIDE_OPTIONS[0]);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOnModifier[]>([]);
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isNutritionOpen, setIsNutritionOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (item) {
      setSelectedSizeId(item.sizeOptions[0]?.id ?? 'regular');
      setIsCombo(false);
      setSelectedDrink(COMBO_DRINK_OPTIONS[0]);
      setSelectedSide(COMBO_SIDE_OPTIONS[0]);
      setSelectedAddOns([]);
      setRemovedIngredients([]);
      setSpecialInstructions('');
      setQuantity(1);
      setIsNutritionOpen(false);
      setImgError(false);
    }
  }, [item]);

  if (!item) return null;

  const currentSize: SizeOption =
    item.sizeOptions.find((s) => s.id === selectedSizeId) ??
    item.sizeOptions[0] ?? {
      id: 'regular',
      label: 'Regular',
      priceDelta: 0,
      caloriesDelta: 0,
    };

  const comboPrice = item.allowComboUpgrade ? (item.comboUpgradePrice ?? 6.5) : 0;
  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);

  const unitPrice =
    item.basePrice + currentSize.priceDelta + (isCombo ? comboPrice : 0) + addOnsTotal;
  const totalPrice = unitPrice * quantity;

  const totalCalories =
    item.nutrition.calories +
    currentSize.caloriesDelta +
    (isCombo ? 360 : 0) +
    selectedAddOns.reduce((sum, a) => sum + a.calories, 0);

  const handleToggleAddOn = (addon: AddOnModifier) => {
    setSelectedAddOns((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  const handleToggleRemoval = (removal: string) => {
    setRemovedIngredients((prev) =>
      prev.includes(removal) ? prev.filter((r) => r !== removal) : [...prev, removal],
    );
  };

  const handleAddToCart = () => {
    const sortedAddOnIds = selectedAddOns
      .map((a) => a.id)
      .sort()
      .join('-');
    const sortedRemovals = [...removedIngredients].sort().join('-');
    const comboKey = isCombo
      ? `combo-${selectedDrink.slice(0, 5)}-${selectedSide.slice(0, 5)}`
      : 'single';
    const cartItemId = `${item.id}-${selectedSizeId}-${comboKey}-${sortedAddOnIds}-${sortedRemovals}`;

    const cartItem: CartItem = {
      cartItemId,
      menuItemId: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      categoryId: item.categoryId,
      basePrice: item.basePrice,
      unitPrice,
      quantity,
      customization: {
        sizeId: selectedSizeId,
        sizeLabel: currentSize.label,
        isCombo,
        comboDrink: isCombo ? selectedDrink : undefined,
        comboSide: isCombo ? selectedSide : undefined,
        selectedAddOns,
        removedIngredients,
        specialInstructions: specialInstructions.trim() || undefined,
      },
    };

    dispatch(addCartItem(cartItem));
    showToast({
      title: `Added ${quantity > 1 ? `${quantity}x ` : ''}${item.name}`,
      description: `${formatAUD(totalPrice)} • ${currentSize.label}${isCombo ? ' Combo' : ''}`,
      tone: 'success',
    });

    onOpenChange(false);
  };

  return (
    <BottomSheetModal
      open={open}
      onOpenChange={onOpenChange}
      title={item.name}
      subtitle={`${totalCalories} kcal • ~${item.prepTimeMinutes}m prep • AUD incl. 10% GST`}
      footer={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {/* Quantity Stepper */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.bgElevated,
              borderColor: colors.borderStrong,
              borderWidth: 1,
              borderRadius: 14,
              padding: 4,
              gap: 8,
            }}
          >
            <Pressable
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              accessibilityRole="button"
              accessibilityLabel="Decrease quantity"
              style={{
                height: 36,
                width: 36,
                borderRadius: 10,
                backgroundColor: colors.bgSurface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Minus size={15} color={colors.textPrimary} />
            </Pressable>

            <Text
              style={{
                minWidth: 22,
                textAlign: 'center',
                color: colors.textPrimary,
                fontSize: 15,
                fontWeight: '900',
              }}
            >
              {quantity}
            </Text>

            <Pressable
              onPress={() => setQuantity((q) => q + 1)}
              accessibilityRole="button"
              accessibilityLabel="Increase quantity"
              style={{
                height: 36,
                width: 36,
                borderRadius: 10,
                backgroundColor: colors.bgSurface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Plus size={15} color={colors.textPrimary} />
            </Pressable>
          </View>

          {/* Add to Bag Button */}
          <View style={{ flex: 1 }}>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              leftIcon={<ShoppingBag size={16} color="#FFFFFF" />}
              onPress={handleAddToCart}
            >
              Add to Bag • {formatAUD(totalPrice)}
            </Button>
          </View>
        </View>
      }
    >
      <View style={{ gap: 18 }}>
        {/* Dish Hero Banner */}
        <View
          style={{
            height: 190,
            borderRadius: 20,
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
                backgroundColor: '#2A1812',
                gap: 6,
              }}
            >
              <Flame size={34} color="#FBBF24" />
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800' }}>
                {item.name}
              </Text>
            </View>
          )}

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
                gap: 5,
                backgroundColor: 'rgba(0,0,0,0.75)',
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 10,
              }}
            >
              <Star size={13} color="#FCD34D" fill="#FCD34D" />
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '800' }}>
                {item.rating.toFixed(1)} ({item.reviewCount} reviews)
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                backgroundColor: 'rgba(0,0,0,0.75)',
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 10,
              }}
            >
              <Clock size={13} color="#F87171" />
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '800' }}>
                ~{item.prepTimeMinutes} mins
              </Text>
            </View>
          </View>
        </View>

        {/* Full Description & Dietary Badges */}
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {item.dietaryTags.map((tag) => (
              <Badge key={tag} tone="success">
                {tag}
              </Badge>
            ))}
          </View>
          <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 19 }}>
            {item.description}
          </Text>
        </View>

        {/* 1. Size Selection */}
        {item.sizeOptions.length > 1 ? (
          <View style={{ gap: 8 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '800' }}>
                1. Choose Portion / Stack Size
              </Text>
              <Badge tone="brand">Required</Badge>
            </View>

            <View style={{ gap: 8 }}>
              {item.sizeOptions.map((size) => {
                const isSelected = size.id === selectedSizeId;
                return (
                  <Pressable
                    key={size.id}
                    onPress={() => setSelectedSizeId(size.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 12,
                      borderRadius: 14,
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? colors.brandPrimary : colors.borderSubtle,
                      backgroundColor: isSelected ? colors.bgElevated : colors.bgSurface,
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          color: isSelected ? colors.brandPrimary : colors.textPrimary,
                          fontSize: 13,
                          fontWeight: '800',
                        }}
                      >
                        {size.label}
                      </Text>
                      <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                        {size.caloriesDelta > 0
                          ? `+${size.caloriesDelta} kcal`
                          : 'Standard portion'}
                      </Text>
                    </View>

                    <Text
                      style={{
                        color: colors.textPrimary,
                        fontSize: 13,
                        fontWeight: '800',
                      }}
                    >
                      {size.priceDelta === 0
                        ? 'Included'
                        : `+${formatAUD(size.priceDelta)}`}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* 2. Combo Meal Upgrade */}
        {item.allowComboUpgrade ? (
          <View
            style={{
              borderRadius: 18,
              borderWidth: isCombo ? 2 : 1,
              borderColor: isCombo ? colors.brandSecondary : colors.borderStrong,
              backgroundColor: colors.bgElevated,
              padding: 14,
              gap: 12,
            }}
          >
            <Pressable
              onPress={() => setIsCombo((prev) => !prev)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <View
                  style={{
                    height: 36,
                    width: 36,
                    borderRadius: 10,
                    backgroundColor: isCombo ? colors.brandSecondary : colors.bgSurface,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles
                    size={18}
                    color={isCombo ? '#FFFFFF' : colors.brandSecondary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontSize: 14,
                      fontWeight: '800',
                    }}
                  >
                    Make it a Melbourne Box Combo
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                    Includes regular side + craft drink (+{formatAUD(comboPrice)} • +360 kcal)
                  </Text>
                </View>
              </View>

              <View
                style={{
                  height: 24,
                  width: 24,
                  borderRadius: 7,
                  backgroundColor: isCombo ? colors.brandSecondary : colors.bgSurface,
                  borderWidth: 1,
                  borderColor: isCombo ? colors.brandSecondary : colors.borderStrong,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isCombo ? <Check size={14} color="#FFFFFF" /> : null}
              </View>
            </Pressable>

            {isCombo ? (
              <View
                style={{
                  gap: 12,
                  paddingTop: 10,
                  borderTopWidth: 1,
                  borderTopColor: colors.borderSubtle,
                }}
              >
                {/* Combo Side Picker */}
                <View style={{ gap: 6 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '800' }}>
                    Choose Combo Side:
                  </Text>
                  <View style={{ gap: 6 }}>
                    {COMBO_SIDE_OPTIONS.map((side) => {
                      const active = selectedSide === side;
                      return (
                        <Pressable
                          key={side}
                          onPress={() => setSelectedSide(side)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingHorizontal: 11,
                            paddingVertical: 8,
                            borderRadius: 10,
                            backgroundColor: colors.bgSurface,
                            borderWidth: 1,
                            borderColor: active ? colors.brandPrimary : colors.borderSubtle,
                          }}
                        >
                          <Text
                            style={{
                              color: active ? colors.brandPrimary : colors.textPrimary,
                              fontSize: 12,
                              fontWeight: active ? '800' : '600',
                            }}
                          >
                            {side}
                          </Text>
                          {active ? <Check size={14} color={colors.brandPrimary} /> : null}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Combo Drink Picker */}
                <View style={{ gap: 6 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '800' }}>
                    Choose Combo Drink:
                  </Text>
                  <View style={{ gap: 6 }}>
                    {COMBO_DRINK_OPTIONS.map((drink) => {
                      const active = selectedDrink === drink;
                      return (
                        <Pressable
                          key={drink}
                          onPress={() => setSelectedDrink(drink)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingHorizontal: 11,
                            paddingVertical: 8,
                            borderRadius: 10,
                            backgroundColor: colors.bgSurface,
                            borderWidth: 1,
                            borderColor: active ? colors.brandPrimary : colors.borderSubtle,
                          }}
                        >
                          <Text
                            style={{
                              color: active ? colors.brandPrimary : colors.textPrimary,
                              fontSize: 12,
                              fontWeight: active ? '800' : '600',
                            }}
                          >
                            {drink}
                          </Text>
                          {active ? <Check size={14} color={colors.brandPrimary} /> : null}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* 3. Add-on Modifiers */}
        {item.availableAddOns.length > 0 ? (
          <View style={{ gap: 8 }}>
            <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '800' }}>
              Extra Toppings, Sauces & Bun Swaps
            </Text>
            <View style={{ gap: 8 }}>
              {item.availableAddOns.map((addon) => {
                const isSelected = selectedAddOns.some((a) => a.id === addon.id);
                return (
                  <Pressable
                    key={addon.id}
                    onPress={() => handleToggleAddOn(addon)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 12,
                      borderRadius: 14,
                      borderWidth: isSelected ? 1.5 : 1,
                      borderColor: isSelected ? colors.brandPrimary : colors.borderSubtle,
                      backgroundColor: isSelected ? colors.bgElevated : colors.bgSurface,
                    }}
                  >
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text
                        style={{
                          color: isSelected ? colors.brandPrimary : colors.textPrimary,
                          fontSize: 13,
                          fontWeight: '700',
                        }}
                      >
                        {addon.name}
                      </Text>
                      <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                        {addon.calories >= 0
                          ? `+${addon.calories} kcal`
                          : `${addon.calories} kcal`}{' '}
                        • {addon.category.toUpperCase()}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text
                        style={{
                          color: colors.textPrimary,
                          fontSize: 12,
                          fontWeight: '800',
                        }}
                      >
                        +{formatAUD(addon.price)}
                      </Text>
                      <View
                        style={{
                          height: 22,
                          width: 22,
                          borderRadius: 6,
                          backgroundColor: isSelected
                            ? colors.brandPrimary
                            : colors.bgElevated,
                          borderWidth: 1,
                          borderColor: isSelected
                            ? colors.brandPrimary
                            : colors.borderStrong,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isSelected ? <Check size={13} color="#FFFFFF" /> : null}
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* 4. Remove Ingredients (for Burgers, Chicken, Wraps) */}
        {item.categoryId === 'burgers' ||
        item.categoryId === 'chicken' ||
        item.categoryId === 'wraps' ? (
          <View style={{ gap: 8 }}>
            <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '800' }}>
              Remove Ingredients (Optional)
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {STANDARD_REMOVALS.map((rem) => {
                const isRemoved = removedIngredients.includes(rem);
                return (
                  <Pressable
                    key={rem}
                    onPress={() => handleToggleRemoval(rem)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: isRemoved ? colors.statusDanger : colors.borderStrong,
                      backgroundColor: isRemoved ? colors.bgElevated : colors.bgSurface,
                    }}
                  >
                    <Text
                      style={{
                        color: isRemoved ? colors.statusDanger : colors.textSecondary,
                        fontSize: 12,
                        fontWeight: '700',
                      }}
                    >
                      {rem}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* 5. Special Kitchen Instructions */}
        <Input
          label="Special Kitchen Notes (Optional)"
          placeholder="e.g. Cut burger in half, extra napkins, sauce on side..."
          value={specialInstructions}
          onChangeText={setSpecialInstructions}
        />

        {/* 6. Collapsible Nutrition & Allergens Accordion */}
        <View
          style={{
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
            backgroundColor: colors.bgElevated,
            overflow: 'hidden',
          }}
        >
          <Pressable
            onPress={() => setIsNutritionOpen((prev) => !prev)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 14,
            }}
          >
            <View>
              <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '800' }}>
                Australian Nutritional Panel & Allergens
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                {item.nutrition.kilojoules} kJ ({item.nutrition.calories} kcal) •{' '}
                {item.nutrition.proteinGrams}g Protein
              </Text>
            </View>
            {isNutritionOpen ? (
              <ChevronUp size={18} color={colors.textSecondary} />
            ) : (
              <ChevronDown size={18} color={colors.textSecondary} />
            )}
          </Pressable>

          {isNutritionOpen ? (
            <View
              style={{
                padding: 14,
                paddingTop: 0,
                gap: 10,
                borderTopWidth: 1,
                borderTopColor: colors.borderSubtle,
              }}
            >
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                {[
                  { label: 'Energy', val: `${item.nutrition.kilojoules} kJ` },
                  { label: 'Calories', val: `${item.nutrition.calories} kcal` },
                  { label: 'Protein', val: `${item.nutrition.proteinGrams}g` },
                  { label: 'Carbs', val: `${item.nutrition.carbsGrams}g` },
                  { label: 'Fat', val: `${item.nutrition.fatGrams}g` },
                  { label: 'Sodium', val: `${item.nutrition.sodiumMg}mg` },
                ].map((metric) => (
                  <View
                    key={metric.label}
                    style={{
                      width: '30%',
                      backgroundColor: colors.bgSurface,
                      borderRadius: 10,
                      padding: 8,
                    }}
                  >
                    <Text style={{ color: colors.textMuted, fontSize: 10 }}>
                      {metric.label}
                    </Text>
                    <Text
                      style={{
                        color: colors.textPrimary,
                        fontSize: 12,
                        fontWeight: '800',
                      }}
                    >
                      {metric.val}
                    </Text>
                  </View>
                ))}
              </View>

              {item.allergens.length > 0 ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={14} color={colors.statusWarning} />
                  <Text style={{ color: colors.textSecondary, fontSize: 11, flex: 1 }}>
                    Contains: {item.allergens.join(', ')}
                  </Text>
                </View>
              ) : (
                <Text style={{ color: colors.statusSuccess, fontSize: 11, fontWeight: '700' }}>
                  No common major allergens declared.
                </Text>
              )}
            </View>
          ) : null}
        </View>
      </View>
    </BottomSheetModal>
  );
}

