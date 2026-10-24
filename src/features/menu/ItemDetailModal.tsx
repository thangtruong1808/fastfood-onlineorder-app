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
  X,
} from 'lucide-react';
import { Dialog } from 'radix-ui';
import { useId, useState } from 'react';
import { toast } from 'sonner';
import { useAppDispatch } from '@/app/hooks';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { addCartItem, setCartDrawerOpen } from '@/features/cart/cartSlice';
import { cn } from '@/lib/cn';
import { formatAUD } from '@/lib/currency';
import type { AddOnModifier, CartItem, MenuItem, SizeOption } from '@/types';

export interface ItemDetailModalProps {
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

export function ItemDetailModal({ item, open, onOpenChange }: ItemDetailModalProps) {
  const dispatch = useAppDispatch();
  const inputId = useId();

  // Selected State
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

  // If modal is closed or item is null, return null early
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

  const unitPrice = item.basePrice + currentSize.priceDelta + (isCombo ? comboPrice : 0) + addOnsTotal;
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
    setRemovedIngredients((prev) => {
      const exists = prev.includes(removal);
      if (exists) {
        return prev.filter((r) => r !== removal);
      }
      return [...prev, removal];
    });
  };

  const handleAddToCart = () => {
    // Generate unique cart item id based on configuration
    const sortedAddOnIds = selectedAddOns.map((a) => a.id).sort().join('-');
    const sortedRemovals = removedIngredients.sort().join('-');
    const comboKey = isCombo ? `combo-${selectedDrink.slice(0, 5)}-${selectedSide.slice(0, 5)}` : 'single';
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

    toast.success(`Added ${quantity > 1 ? `${quantity}x ` : ''}${item.name} to order bag`, {
      description: `${formatAUD(totalPrice)} • ${currentSize.label}${isCombo ? ' Meal' : ''}`,
      action: {
        label: 'View Bag',
        onClick: () => dispatch(setCartDrawerOpen(true)),
      },
    });

    onOpenChange(false);
  };

  // Reset state when closing or re-opening a different item
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset after transition
      setTimeout(() => {
        setSelectedSizeId('regular');
        setIsCombo(false);
        setSelectedAddOns([]);
        setRemovedIngredients([]);
        setSpecialInstructions('');
        setQuantity(1);
        setIsNutritionOpen(false);
        setImgError(false);
      }, 200);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 flex max-h-[92vh] w-[calc(100%-1.5rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-3xl border border-border-subtle bg-bg-surface text-text-primary shadow-elevated focus:outline-none"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
            <div className="flex items-center gap-2">
              <Badge tone="brand" className="uppercase font-bold tracking-wider text-[11px]">
                {item.categoryId}
              </Badge>
              {item.isPopular && <Badge tone="amber">Popular</Badge>}
              {item.isFeatured && <Badge tone="success">Chef Special</Badge>}
            </div>
            <Dialog.Close
              aria-label="Close customization modal"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary cursor-pointer"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Visual Header / Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-bg-elevated border border-border-subtle">
              <div className="relative aspect-16/9 w-full overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-900">
                {!imgError ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    onError={() => setImgError(true)}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div
                    className={cn(
                      'flex h-full w-full flex-col items-center justify-center bg-gradient-to-br p-6 text-white text-center',
                      item.fallbackGradient,
                    )}
                  >
                    <Flame className="h-12 w-12 text-amber-300 mb-2 opacity-80" />
                    <p className="font-display text-xl font-bold">{item.name}</p>
                    <p className="text-xs text-amber-100/80">Flame-Grilled in Melbourne</p>
                  </div>
                )}

                <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                  <div className="flex items-center gap-1 rounded-full bg-black/75 px-2.5 py-1 text-xs font-bold text-amber-300 backdrop-blur-xs">
                    <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                    <span>{item.rating.toFixed(1)}</span>
                    <span className="text-white/60 text-[10px]">({item.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-black/75 px-2.5 py-1 text-xs font-semibold text-white/90 backdrop-blur-xs">
                    <Clock className="h-3.5 w-3.5 text-brand-primary" />
                    <span>~{item.prepTimeMinutes}m prep</span>
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <div className="p-4 sm:p-5">
                <Dialog.Title className="font-display text-2xl font-bold tracking-tight text-text-primary">
                  {item.name}
                </Dialog.Title>
                <Dialog.Description className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                  {item.description}
                </Dialog.Description>

                {/* Energy & Dietary Tags */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-bg-surface px-2.5 py-1 text-xs font-bold text-text-primary border border-border-subtle">
                    {totalCalories} kcal ({Math.round(totalCalories * 4.184)} kJ)
                  </span>
                  {item.dietaryTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Allergens Notice */}
            {item.allergens.length > 0 && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-200">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                <div>
                  <span className="font-bold">Allergen Notice: </span>
                  <span>Contains {item.allergens.join(', ')}. </span>
                  <span className="text-amber-800/80 dark:text-amber-300/80">
                    Prepared in a kitchen environment handling gluten, dairy, nuts, and sesame.
                  </span>
                </div>
              </div>
            )}

            {/* Collapsible Nutritional Breakdown */}
            <div className="rounded-2xl border border-border-subtle bg-bg-surface p-4">
              <button
                type="button"
                onClick={() => setIsNutritionOpen(!isNutritionOpen)}
                className="flex w-full items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary cursor-pointer"
              >
                <span>Nutritional Value Breakdown (per serving)</span>
                {isNutritionOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {isNutritionOpen && (
                <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border-subtle pt-3 text-center sm:grid-cols-6">
                  <div className="rounded-xl bg-bg-elevated p-2">
                    <span className="block text-xs font-bold text-text-primary">
                      {item.nutrition.proteinGrams}g
                    </span>
                    <span className="text-[10px] text-text-muted">Protein</span>
                  </div>
                  <div className="rounded-xl bg-bg-elevated p-2">
                    <span className="block text-xs font-bold text-text-primary">
                      {item.nutrition.carbsGrams}g
                    </span>
                    <span className="text-[10px] text-text-muted">Carbs</span>
                  </div>
                  <div className="rounded-xl bg-bg-elevated p-2">
                    <span className="block text-xs font-bold text-text-primary">
                      {item.nutrition.fatGrams}g
                    </span>
                    <span className="text-[10px] text-text-muted">Total Fat</span>
                  </div>
                  <div className="rounded-xl bg-bg-elevated p-2">
                    <span className="block text-xs font-bold text-text-primary">
                      {item.nutrition.sodiumMg}mg
                    </span>
                    <span className="text-[10px] text-text-muted">Sodium</span>
                  </div>
                  <div className="rounded-xl bg-bg-elevated p-2">
                    <span className="block text-xs font-bold text-text-primary">
                      {item.nutrition.calories}
                    </span>
                    <span className="text-[10px] text-text-muted">Calories</span>
                  </div>
                  <div className="rounded-xl bg-bg-elevated p-2">
                    <span className="block text-xs font-bold text-text-primary">
                      {item.nutrition.kilojoules}
                    </span>
                    <span className="text-[10px] text-text-muted">Kilojoules</span>
                  </div>
                </div>
              )}
            </div>

            {/* Customization 1: Size Selection */}
            {item.sizeOptions.length > 1 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-text-primary">
                    1. Choose Portion Size
                  </label>
                  <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-bold text-brand-primary">
                    Required
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {item.sizeOptions.map((size) => {
                    const isSelected = selectedSizeId === size.id;
                    return (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => setSelectedSizeId(size.id)}
                        className={cn(
                          'flex flex-col items-start rounded-2xl border p-3.5 text-left transition-all cursor-pointer',
                          isSelected
                            ? 'border-brand-primary bg-brand-primary/8 shadow-xs ring-2 ring-brand-primary'
                            : 'border-border-subtle bg-bg-surface hover:border-border-strong hover:bg-bg-elevated',
                        )}
                      >
                        <div className="flex w-full items-center justify-between">
                          <span className="text-xs font-bold text-text-primary">{size.label}</span>
                          <span
                            className={cn(
                              'flex h-4 w-4 items-center justify-center rounded-full border text-[10px]',
                              isSelected
                                ? 'border-brand-primary bg-brand-primary text-white'
                                : 'border-border-strong bg-transparent',
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </span>
                        </div>
                        <span className="mt-2 text-xs font-semibold text-brand-primary">
                          {size.priceDelta > 0 ? `+${formatAUD(size.priceDelta)}` : 'Standard'}
                        </span>
                        {size.caloriesDelta !== 0 && (
                          <span className="text-[10px] text-text-muted">
                            {size.caloriesDelta > 0 ? `+${size.caloriesDelta}` : size.caloriesDelta} kcal
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Customization 2: Make it a Combo Meal */}
            {item.allowComboUpgrade && (
              <div className="rounded-2xl border border-brand-primary/30 bg-gradient-to-br from-brand-primary/5 via-amber-500/5 to-transparent p-4 sm:p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary text-white">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <div>
                      <h4 className="font-display text-sm font-bold text-text-primary">
                        Make it a Southern Cross Meal
                      </h4>
                      <p className="text-xs text-text-secondary">
                        Adds signature rosemary sea-salt chips &amp; cold craft beverage
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-brand-primary">
                      +{formatAUD(comboPrice)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCombo(!isCombo)}
                      className={cn(
                        'mt-1 block rounded-xl px-3 py-1 text-xs font-bold transition-all cursor-pointer',
                        isCombo
                          ? 'bg-brand-primary text-white'
                          : 'border border-border-strong bg-bg-surface text-text-primary hover:border-brand-primary',
                      )}
                    >
                      {isCombo ? 'Meal Selected ✓' : '+ Add Meal'}
                    </button>
                  </div>
                </div>

                {/* Sub-options for Combo: Drink & Side selection */}
                {isCombo && (
                  <div className="space-y-3.5 border-t border-brand-primary/20 pt-3.5 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                        Select Craft Beverage
                      </label>
                      <select
                        value={selectedDrink}
                        onChange={(e) => setSelectedDrink(e.target.value)}
                        className="w-full rounded-xl border border-border-strong bg-bg-surface px-3 py-2 text-xs font-semibold text-text-primary focus:border-brand-primary focus:outline-none"
                      >
                        {COMBO_DRINK_OPTIONS.map((drink) => (
                          <option key={drink} value={drink}>
                            {drink}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                        Select Golden Side
                      </label>
                      <select
                        value={selectedSide}
                        onChange={(e) => setSelectedSide(e.target.value)}
                        className="w-full rounded-xl border border-border-strong bg-bg-surface px-3 py-2 text-xs font-semibold text-text-primary focus:border-brand-primary focus:outline-none"
                      >
                        {COMBO_SIDE_OPTIONS.map((side) => (
                          <option key={side} value={side}>
                            {side}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Customization 3: Add-Ons */}
            {item.availableAddOns.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-text-primary">
                    2. Extra Add-Ons &amp; Sauces
                  </label>
                  <span className="text-xs text-text-muted">Optional</span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {item.availableAddOns.map((addon) => {
                    const isChecked = selectedAddOns.some((a) => a.id === addon.id);
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => handleToggleAddOn(addon)}
                        className={cn(
                          'flex items-center justify-between rounded-xl border p-3 text-left transition-all cursor-pointer',
                          isChecked
                            ? 'border-brand-primary bg-brand-primary/5 text-text-primary ring-1 ring-brand-primary'
                            : 'border-border-subtle bg-bg-surface text-text-secondary hover:border-border-strong hover:bg-bg-elevated',
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={cn(
                              'flex h-4 w-4 items-center justify-center rounded-md border text-[10px]',
                              isChecked
                                ? 'border-brand-primary bg-brand-primary text-white'
                                : 'border-border-strong bg-transparent',
                            )}
                          >
                            {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-text-primary">{addon.name}</p>
                            <span className="text-[10px] text-text-muted">+{addon.calories} kcal</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-brand-primary">
                          +{formatAUD(addon.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Customization 4: Removals */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-text-primary">
                  3. Exclude Ingredients
                </label>
                <span className="text-xs text-text-muted">No extra charge</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {STANDARD_REMOVALS.map((rem) => {
                  const isRemoved = removedIngredients.includes(rem);
                  return (
                    <button
                      key={rem}
                      type="button"
                      onClick={() => handleToggleRemoval(rem)}
                      className={cn(
                        'rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer',
                        isRemoved
                          ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 line-through'
                          : 'border-border-subtle bg-bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary',
                      )}
                    >
                      {rem}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customization 5: Special Instructions */}
            <div className="space-y-2">
              <label htmlFor={inputId} className="text-sm font-bold text-text-primary">
                4. Kitchen Notes &amp; Special Requests
              </label>
              <textarea
                id={inputId}
                rows={2}
                maxLength={120}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Extra crispy bacon, sauce packed separately, cut in half..."
                className="w-full rounded-2xl border border-border-strong bg-bg-surface p-3 text-xs text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>
          </div>

          {/* Sticky Modal Footer with Live Animated AUD Price */}
          <div className="border-t border-border-subtle bg-bg-elevated/90 px-6 py-4 rounded-b-3xl backdrop-blur-xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Quantity Stepper */}
              <div className="flex items-center justify-between gap-3 sm:justify-start">
                <span className="text-xs font-bold text-text-muted sm:hidden">Quantity:</span>
                <div className="flex items-center rounded-2xl border border-border-strong bg-bg-surface p-1 shadow-2xs">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-text-secondary hover:bg-bg-elevated disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-9 text-center font-display text-sm font-bold text-text-primary">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    disabled={quantity >= 20}
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-text-secondary hover:bg-bg-elevated disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-right sm:text-left">
                  <p className="text-[11px] text-text-muted">
                    {formatAUD(unitPrice)} ea • incl. 10% GST
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto shadow-md"
                leftIcon={<ShoppingBag className="h-4 w-4" />}
                onClick={handleAddToCart}
              >
                Add to Bag • {formatAUD(totalPrice)}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

