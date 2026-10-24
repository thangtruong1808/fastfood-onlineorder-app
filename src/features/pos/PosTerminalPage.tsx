import {
  ArrowLeft,
  Bike,
  Check,
  CreditCard,
  Minus,
  Plus,
  Printer,
  Search,
  Store as StoreIcon,
  Tag,
  Trash2,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { BrandLogo } from '@/components/common/BrandLogo';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { MENU_CATEGORIES, MENU_ITEMS } from '@/data/menuSeed';
import { MELBOURNE_STORES } from '@/data/storesSeed';
import { createOrder } from '@/features/orders/ordersSlice';
import { ItemDetailModal } from '@/features/menu/ItemDetailModal';
import { cn } from '@/lib/cn';
import { calculateIncludedGST, formatAUD, roundCurrency } from '@/lib/currency';
import { formatMelbDate, formatMelbTime } from '@/lib/date';
import type { CartItem, MenuCategoryId, MenuItem, OrderRecord } from '@/types';

type PosOrderMode = 'dine_in' | 'takeaway' | 'drive_thru';
type PosDiscountType = 'none' | 'staff_10' | 'promo_15' | 'promo_10_flat';

function getEstimatedPosReadyTime(minutes = 8): string {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

function getPosTimestamp(): string {
  return new Date().toISOString();
}

export default function PosTerminalPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { currentUser } = useAppSelector((state) => state.auth);
  const { selectedStoreId } = useAppSelector((state) => state.store);

  // POS Station State
  const [currentStoreId, setCurrentStoreId] = useState<string>(
    selectedStoreId || 'melb-fitzroy-brunswick',
  );
  const [orderMode, setOrderMode] = useState<PosOrderMode>('dine_in');
  const [tableOrBuzzer, setTableOrBuzzer] = useState('Table 14');
  const [ticketNumber, setTicketNumber] = useState(104);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<MenuCategoryId | 'all'>('all');

  // Active Ticket Items
  const [ticketItems, setTicketItems] = useState<CartItem[]>([]);
  const [activeDiscount, setActiveDiscount] = useState<PosDiscountType>('none');
  const [kitchenNote, setKitchenNote] = useState('');
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);

  // Cash Tender & Docket Modal State
  const [cashModalOpen, setCashModalOpen] = useState(false);
  const [tenderedAmount, setTenderedAmount] = useState<number>(50);
  const [docketModalOpen, setDocketModalOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);

  const activeStore =
    MELBOURNE_STORES.find((s) => s.id === currentStoreId) ?? MELBOURNE_STORES[0];

  // Ticket Financials
  const subtotal = roundCurrency(
    ticketItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0),
  );

  const discountAmount = useMemo(() => {
    switch (activeDiscount) {
      case 'staff_10':
        return roundCurrency(subtotal * 0.1);
      case 'promo_15':
        return subtotal >= 25 ? roundCurrency(subtotal * 0.15) : 0;
      case 'promo_10_flat':
        return subtotal >= 45 ? 10.0 : 0;
      case 'none':
      default:
        return 0;
    }
  }, [subtotal, activeDiscount]);

  const totalDue = roundCurrency(Math.max(0, subtotal - discountAmount));
  const gstIncluded = calculateIncludedGST(totalDue);
  const totalItemCount = ticketItems.reduce((acc, item) => acc + item.quantity, 0);

  // Filter Catalog
  const filteredMenuItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      if (activeCategory !== 'all' && item.categoryId !== activeCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          item.name.toLowerCase().includes(q) ||
          item.shortDescription.toLowerCase().includes(q) ||
          item.categoryId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeCategory, searchQuery]);

  // Quick 1-Tap Add to Ticket
  const handleQuickAdd = (item: MenuItem) => {
    const regularSize = item.sizeOptions[0] ?? {
      id: 'regular',
      label: 'Regular',
      priceDelta: 0,
      caloriesDelta: 0,
    };

    const cartItemId = `${item.id}-regular-single`;

    setTicketItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.cartItemId === cartItemId);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx].quantity += 1;
        return copy;
      }
      return [
        ...prev,
        {
          cartItemId,
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
        },
      ];
    });

    toast.success(`Added ${item.name}`, { duration: 1200 });
  };

  // Modify quantity in ticket
  const handleUpdateQuantity = (cartItemId: string, nextQty: number) => {
    setTicketItems((prev) => {
      if (nextQty <= 0) {
        return prev.filter((i) => i.cartItemId !== cartItemId);
      }
      return prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: nextQty } : item,
      );
    });
  };

  const handleClearTicket = () => {
    setTicketItems([]);
    setActiveDiscount('none');
    setKitchenNote('');
    toast.info('Ticket cleared');
  };

  // Finalize Transaction
  const handleFinalizeTransaction = (methodLabel: string) => {
    if (ticketItems.length === 0) {
      toast.error('Ticket is empty! Add items before charging.');
      return;
    }

    const orderNumber = `POS-${ticketNumber}`;
    const orderId = `ord-pos-${ticketNumber}`;
    const earnedPoints = Math.round(totalDue * 10);

    const orderRecord: OrderRecord = {
      id: orderId,
      orderNumber,
      createdAt: getPosTimestamp(),
      estimatedReadyAt: getEstimatedPosReadyTime(8),
      status: 'received',
      fulfillmentMode: orderMode === 'takeaway' ? 'pickup' : 'pickup',
      storeId: activeStore.id,
      storeName: activeStore.name,
      storeSuburb: activeStore.suburb,
      scheduledSlot: `${orderMode.toUpperCase()} (${tableOrBuzzer})`,
      customerName: `Counter Guest (${tableOrBuzzer})`,
      customerPhone: '0400 000 000',
      customerEmail: 'pos-counter@southerncrossburgers.com.au',
      items: [...ticketItems],
      subtotal,
      discountAmount,
      promoCode: activeDiscount !== 'none' ? activeDiscount.toUpperCase() : undefined,
      deliveryFee: 0,
      gstIncluded,
      total: totalDue,
      paymentMethodLabel: methodLabel,
      loyaltyPointsEarned: earnedPoints,
    };

    dispatch(createOrder(orderRecord));
    setCompletedOrder(orderRecord);
    setDocketModalOpen(true);

    // Reset Ticket for next customer in line
    setTicketItems([]);
    setActiveDiscount('none');
    setKitchenNote('');
    setTicketNumber((prev) => prev + 1);
    setTableOrBuzzer(`Table ${(ticketNumber % 20) + 1}`);

    toast.success(`Paid ${formatAUD(totalDue)} via ${methodLabel}!`);
  };

  const handleOpenCashModal = (presetAmount?: number) => {
    if (ticketItems.length === 0) {
      toast.error('Ticket is empty!');
      return;
    }
    const tender = presetAmount ?? Math.ceil(totalDue / 10) * 10;
    setTenderedAmount(tender);
    setCashModalOpen(true);
  };

  const handleCompleteCashPayment = () => {
    setCashModalOpen(false);
    handleFinalizeTransaction(`Cash Tender (A$${tenderedAmount.toFixed(2)})`);
  };

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col overflow-hidden bg-bg-primary text-text-primary select-none">
      {/* 1. TOP STATION CONTROL BAR */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-subtle bg-bg-surface px-4 shadow-xs">
        {/* Left: Brand + Register & Kitchen Station */}
        <div className="flex items-center gap-3">
          <BrandLogo compact size="sm" />
          <div className="flex items-center gap-2 rounded-xl border border-border-strong bg-bg-elevated px-2.5 py-1 text-xs">
            <span className="font-extrabold text-brand-primary">REG 01</span>
            <span className="text-text-muted">•</span>
            <select
              aria-label="Select Kitchen Station"
              value={currentStoreId}
              onChange={(e) => setCurrentStoreId(e.target.value)}
              className="bg-transparent font-bold text-text-primary focus:outline-none cursor-pointer"
            >
              {MELBOURNE_STORES.map((s) => (
                <option key={s.id} value={s.id} className="bg-bg-surface">
                  {s.suburb} Kitchen
                </option>
              ))}
            </select>
          </div>

          <div className="hidden items-center gap-1.5 rounded-xl border border-border-subtle bg-bg-surface px-2.5 py-1 text-xs font-semibold text-text-secondary sm:inline-flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Clerk: {currentUser.name.split(' ')[0]}</span>
          </div>
        </div>

        {/* Center: Touch Order Mode Selector */}
        <div className="flex items-center rounded-xl border border-border-subtle bg-bg-elevated p-0.5">
          {[
            { id: 'dine_in' as const, label: 'Dine-In', icon: UtensilsCrossed },
            { id: 'takeaway' as const, label: 'Takeaway', icon: StoreIcon },
            { id: 'drive_thru' as const, label: 'Drive-Thru', icon: Bike },
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = orderMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setOrderMode(mode.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer',
                  isSelected
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-text-secondary hover:text-text-primary',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Quick Search + Theme Toggle + Switch to Webfront */}
        <div className="flex items-center gap-2.5">
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Quick search item / SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-44 rounded-xl border border-border-strong bg-bg-elevated pl-7 pr-3 text-xs font-bold text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <ThemeToggle />

          {/* Switch to Web Storefront Button */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-brand-primary/40 text-brand-primary hover:bg-brand-primary/10 text-xs font-bold"
            leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
            onClick={() => navigate('/')}
          >
            Web Storefront
          </Button>
        </div>
      </header>

      {/* 2. MAIN SPLIT REGISTER WORKSPACE (65% Product Grid | 35% Active Bill Ticket) */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL: Category Ribbon & Product Tiles Grid (~65%) */}
        <div className="flex flex-1 flex-col overflow-hidden border-r border-border-subtle bg-bg-primary">
          {/* Category Touch Ribbon */}
          <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-border-subtle bg-bg-surface px-3 py-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={cn(
                'shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer',
                activeCategory === 'all'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'border border-border-subtle bg-bg-surface text-text-secondary hover:border-brand-primary/50 hover:text-text-primary',
              )}
            >
              All Items ({MENU_ITEMS.length})
            </button>
            {MENU_CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.id;
              const count = MENU_ITEMS.filter((i) => i.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    'shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                    isSelected
                      ? 'bg-brand-primary text-white shadow-xs'
                      : 'border border-border-subtle bg-bg-surface text-text-secondary hover:border-brand-primary/50 hover:text-text-primary',
                  )}
                >
                  <span>{cat.shortName}</span>
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.2 text-[10px] font-extrabold',
                      isSelected ? 'bg-white/20 text-white' : 'bg-bg-elevated text-text-muted',
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Product Touch Grid */}
          <div className="flex-1 overflow-y-auto p-3.5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {filteredMenuItems.map((item) => (
                <article
                  key={item.id}
                  tabIndex={0}
                  role="button"
                  onClick={() => handleQuickAdd(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleQuickAdd(item);
                    }
                  }}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface p-3 text-left shadow-2xs transition-all active:scale-[0.97] hover:border-brand-primary hover:shadow-card cursor-pointer"
                >
                  <div className="space-y-2">
                    {/* Item Thumbnail & Price Tag */}
                    <div className="relative aspect-16/11 w-full overflow-hidden rounded-xl bg-neutral-900">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Price Pill */}
                      <span className="absolute bottom-2 right-2 rounded-lg bg-black/80 px-2 py-0.5 font-display text-xs font-extrabold text-amber-300 backdrop-blur-xs shadow-xs">
                        {formatAUD(item.basePrice)}
                      </span>
                      {item.isFeatured && (
                        <span className="absolute top-2 left-2 rounded-md bg-brand-primary px-1.5 py-0.5 text-[9px] font-extrabold text-white shadow-xs">
                          Chef Spec
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-display text-xs font-bold leading-tight text-text-primary line-clamp-1 group-hover:text-brand-primary">
                        {item.name}
                      </h3>
                      <p className="mt-0.5 text-[10px] text-text-muted truncate">
                        {item.nutrition.calories} kcal • {item.prepTimeMinutes}m prep
                      </p>
                    </div>
                  </div>

                  {/* Bottom Action Bar on tile */}
                  <div className="mt-2.5 flex items-center justify-between border-t border-border-subtle pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItemForModal(item);
                      }}
                      className="rounded-lg border border-border-subtle bg-bg-elevated px-2 py-1 text-[10px] font-bold text-text-secondary hover:border-brand-primary hover:text-text-primary"
                    >
                      Custom
                    </button>
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-primary text-white shadow-2xs group-hover:scale-110 transition-transform">
                      <Plus className="h-3.5 w-3.5 stroke-[3]" />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Live Register Ticket & Fast Tender (~35%, max 420px) */}
        <div className="flex w-[360px] lg:w-[400px] shrink-0 flex-col overflow-hidden bg-bg-surface border-l border-border-subtle shadow-card">
          {/* Ticket Header */}
          <div className="flex items-center justify-between border-b border-border-subtle bg-bg-elevated px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-extrabold text-text-primary">
                Ticket #T-{ticketNumber}
              </span>
              <Badge tone="brand" className="uppercase font-bold text-[10px]">
                {orderMode.replace('_', '-')}
              </Badge>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="text"
                aria-label="Table or Buzzer number"
                value={tableOrBuzzer}
                onChange={(e) => setTableOrBuzzer(e.target.value)}
                className="w-20 rounded-lg border border-border-strong bg-bg-surface px-2 py-1 text-center text-xs font-bold text-text-primary focus:border-brand-primary focus:outline-none"
              />
              {ticketItems.length > 0 && (
                <button
                  type="button"
                  title="Clear entire ticket"
                  onClick={handleClearTicket}
                  className="rounded-lg p-1 text-text-muted hover:bg-bg-surface hover:text-red-500 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Ticket Scrollable Line Items */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2 divide-y divide-border-subtle">
            {ticketItems.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-6 space-y-2 text-text-muted">
                <StoreIcon className="h-8 w-8 text-border-strong" />
                <p className="font-bold text-xs">Active Ticket is Empty</p>
                <p className="text-[11px] text-text-secondary">
                  Tap items on the left catalog grid to add them to this counter order.
                </p>
              </div>
            ) : (
              ticketItems.map((item) => (
                <div key={item.cartItemId} className="pt-2 first:pt-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-text-primary truncate">
                          {item.name}
                        </span>
                      </div>

                      {/* Customization Details */}
                      <div className="flex flex-wrap gap-1 pt-0.5 text-[10px] text-text-muted">
                        <span className="font-semibold text-text-secondary">
                          {item.customization.sizeLabel}
                        </span>
                        {item.customization.isCombo && (
                          <span className="text-amber-600 dark:text-amber-400 font-bold">
                            • Meal Upgrade
                          </span>
                        )}
                        {item.customization.selectedAddOns.map((a) => (
                          <span key={a.id}>• +{a.name.replace('Extra ', '')}</span>
                        ))}
                        {item.customization.removedIngredients.map((r) => (
                          <span key={r} className="line-through text-red-500">
                            • {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    <span className="font-bold text-xs text-text-primary whitespace-nowrap">
                      {formatAUD(item.unitPrice * item.quantity)}
                    </span>
                  </div>

                  {/* Quantity Touch Stepper & Remove */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-text-muted">
                      {formatAUD(item.unitPrice)} ea
                    </span>

                    <div className="flex items-center rounded-lg border border-border-strong bg-bg-elevated p-0.5">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() =>
                          handleUpdateQuantity(item.cartItemId, item.quantity - 1)
                        }
                        className="flex h-6 w-6 items-center justify-center rounded text-text-secondary hover:bg-bg-surface cursor-pointer"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-text-primary">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() =>
                          handleUpdateQuantity(item.cartItemId, item.quantity + 1)
                        }
                        className="flex h-6 w-6 items-center justify-center rounded text-text-secondary hover:bg-bg-surface cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Discounts & Kitchen Notes Ribbon */}
          <div className="border-t border-border-subtle bg-bg-elevated/40 p-2.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-text-secondary">
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3 text-brand-primary" />
                <span>POS Discount:</span>
              </span>
              <div className="flex items-center gap-1">
                {(
                  [
                    { id: 'none' as const, label: '0%' },
                    { id: 'staff_10' as const, label: '10% Staff' },
                    { id: 'promo_15' as const, label: '15% MELB15' },
                    { id: 'promo_10_flat' as const, label: '-A$10' },
                  ] as const
                ).map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setActiveDiscount(d.id)}
                    className={cn(
                      'rounded-md px-1.5 py-0.5 text-[10px] font-bold transition-all cursor-pointer',
                      activeDiscount === d.id
                        ? 'bg-brand-primary text-white'
                        : 'border border-border-subtle bg-bg-surface text-text-secondary hover:border-brand-primary',
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Kitchen Note quick input */}
            <input
              type="text"
              placeholder="Add kitchen note (e.g. Cut in half, allergy)..."
              value={kitchenNote}
              onChange={(e) => setKitchenNote(e.target.value)}
              className="w-full rounded-lg border border-border-strong bg-bg-surface px-2.5 py-1 text-[11px] font-medium text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none"
            />
          </div>

          {/* Ticket Financial Totals */}
          <div className="border-t border-border-subtle bg-bg-surface p-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal ({totalItemCount} items)</span>
              <span>{formatAUD(subtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                <span>Discount Applied</span>
                <span>-{formatAUD(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-[11px] text-text-muted border-t border-border-subtle pt-1">
              <span>Includes 10% Australian GST</span>
              <span>{formatAUD(gstIncluded)}</span>
            </div>

            <div className="flex justify-between items-baseline border-t border-border-subtle pt-1">
              <span className="font-extrabold text-sm text-text-primary">TOTAL DUE</span>
              <span className="font-display text-xl font-black text-brand-primary">
                {formatAUD(totalDue)}
              </span>
            </div>
          </div>

          {/* FAST CASH TENDER & TICKET CHARGE ACTIONS */}
          <div className="border-t border-border-subtle bg-bg-elevated p-3 space-y-2">
            {/* Quick Cash Buttons */}
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => handleOpenCashModal(totalDue)}
                className="rounded-xl border border-border-strong bg-bg-surface py-1.5 text-center text-xs font-bold text-text-primary hover:border-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer"
              >
                Exact Cash
              </button>
              <button
                type="button"
                onClick={() => handleOpenCashModal(20)}
                className="rounded-xl border border-border-strong bg-bg-surface py-1.5 text-center text-xs font-bold text-text-primary hover:border-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer"
              >
                A$20
              </button>
              <button
                type="button"
                onClick={() => handleOpenCashModal(50)}
                className="rounded-xl border border-border-strong bg-bg-surface py-1.5 text-center text-xs font-bold text-text-primary hover:border-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer"
              >
                A$50
              </button>
              <button
                type="button"
                onClick={() => handleOpenCashModal(100)}
                className="rounded-xl border border-border-strong bg-bg-surface py-1.5 text-center text-xs font-bold text-text-primary hover:border-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer"
              >
                A$100
              </button>
            </div>

            {/* Main Charge Button (EFTPOS / Card Terminal Tap) */}
            <button
              type="button"
              disabled={ticketItems.length === 0}
              onClick={() => handleFinalizeTransaction('EFTPOS Terminal Tap (Card)')}
              className="flex w-full items-center justify-between rounded-xl bg-brand-primary px-4 py-3 text-white shadow-elevated transition-transform active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <span className="font-display text-sm font-black uppercase tracking-wider">
                  Charge EFTPOS
                </span>
              </div>
              <span className="font-display text-base font-extrabold text-amber-200">
                {formatAUD(totalDue)}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Item Customization Modal */}
      <ItemDetailModal
        item={selectedItemForModal}
        open={Boolean(selectedItemForModal)}
        onOpenChange={(open) => !open && setSelectedItemForModal(null)}
      />

      {/* Cash Tender & Change Due Modal */}
      <Modal
        open={cashModalOpen}
        onOpenChange={setCashModalOpen}
        title="Cash Tender & Change Due Calculator"
        description={`Ticket #T-${ticketNumber} • ${tableOrBuzzer}`}
        maxWidthClass="max-w-md"
        footer={
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="md"
              className="flex-1"
              onClick={() => setCashModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={tenderedAmount < totalDue}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              rightIcon={<Check className="h-4 w-4" />}
              onClick={handleCompleteCashPayment}
            >
              Confirm &amp; Pop Drawer
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-1 text-xs">
          <div className="flex justify-between items-baseline border-b border-border-subtle pb-3">
            <span className="font-bold text-text-secondary">TOTAL AMOUNT DUE:</span>
            <span className="font-display text-xl font-black text-brand-primary">
              {formatAUD(totalDue)}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold uppercase tracking-wider text-text-secondary">
              Cash Tendered (AUD)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-text-muted">A$</span>
              <input
                type="number"
                step="0.05"
                min="0"
                value={tenderedAmount}
                onChange={(e) => setTenderedAmount(parseFloat(e.target.value) || 0)}
                className="flex-1 rounded-xl border border-border-strong bg-bg-elevated p-2.5 font-display text-lg font-extrabold text-text-primary focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Change Due Box */}
          <div
            className={cn(
              'rounded-2xl border p-4 text-center space-y-1',
              tenderedAmount >= totalDue
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
                : 'border-red-500/40 bg-red-500/10 text-red-900 dark:text-red-200',
            )}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {tenderedAmount >= totalDue ? 'CHANGE TO RETURN TO GUEST' : 'INSUFFICIENT TENDER AMOUNT'}
            </span>
            <p className="font-display text-3xl font-black">
              {tenderedAmount >= totalDue
                ? formatAUD(roundCurrency(tenderedAmount - totalDue))
                : `Short by ${formatAUD(roundCurrency(totalDue - tenderedAmount))}`}
            </p>
          </div>
        </div>
      </Modal>

      {/* Kitchen Docket / Receipt Modal */}
      {completedOrder && (
        <Modal
          open={docketModalOpen}
          onOpenChange={setDocketModalOpen}
          title={`Order #${completedOrder.orderNumber} Completed`}
          description="Kitchen ticket dispatched"
          maxWidthClass="max-w-md"
          footer={
            <div className="flex justify-between gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Printer className="h-4 w-4" />}
                onClick={() => window.print()}
              >
                Print Kitchen Docket
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setDocketModalOpen(false)}
              >
                Next Order
              </Button>
            </div>
          }
        >
          <div className="space-y-3 font-mono text-xs">
            <div className="text-center border-b border-border-subtle pb-3">
              <h4 className="font-bold text-sm">Southern Cross Burgers</h4>
              <p className="text-[10px] text-text-muted">KITCHEN DOCKET • EXPRESS BAY</p>
              <p className="text-text-primary font-bold">{completedOrder.scheduledSlot}</p>
              <p className="text-text-muted">
                {formatMelbDate(completedOrder.createdAt)} • {formatMelbTime(completedOrder.createdAt)}
              </p>
            </div>

            <div className="space-y-1.5 divide-y divide-border-subtle">
              {completedOrder.items.map((i) => (
                <div key={i.cartItemId} className="pt-1.5 flex justify-between font-bold">
                  <span>
                    {i.quantity}x {i.name} ({i.customization.sizeLabel})
                  </span>
                  <span>{formatAUD(i.unitPrice * i.quantity)}</span>
                </div>
              ))}
            </div>

            {completedOrder.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold border-t border-border-subtle pt-1.5">
                <span>Discount</span>
                <span>-{formatAUD(completedOrder.discountAmount)}</span>
              </div>
            )}

            <div className="border-t border-border-subtle pt-2 flex justify-between text-sm font-extrabold text-text-primary">
              <span>TOTAL PAID</span>
              <span className="text-brand-primary">{formatAUD(completedOrder.total)}</span>
            </div>

            <div className="text-[10px] text-text-muted text-center pt-2">
              Payment: {completedOrder.paymentMethodLabel}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
