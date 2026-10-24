import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { MENU_SEED } from '../src/data/menuSeed';
import { STORES_SEED } from '../src/data/storesSeed';
import { MenuCategory, MenuItem, OrderRecord } from '../src/types';
import { formatAUD, GST_RATE } from '../src/lib/currency';
import { useAppDispatch } from '../src/app/hooks';
import { createOrder } from '../src/features/orders/ordersSlice';
import { useToast } from '../src/components/common/ToastProvider';
import { BottomSheetModal } from '../src/components/ui/BottomSheetModal';
import { Button } from '../src/components/ui/Button';
import { Badge } from '../src/components/ui/Badge';
import { ThemeToggle } from '../src/components/common/ThemeToggle';

interface PosTicketItem {
  item: MenuItem;
  quantity: number;
  selectedSizeLabel: string;
  unitPrice: number;
}

type OrderMode = 'dine_in' | 'takeaway' | 'drive_thru';
type DiscountType = 'none' | 'staff_10' | 'promo_15' | 'promo_10_flat';

const CATEGORIES: { id: MenuCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Menu' },
  { id: 'burgers', label: 'Burgers' },
  { id: 'chicken', label: 'Chicken' },
  { id: 'combos', label: 'Combos' },
  { id: 'sides', label: 'Sides' },
  { id: 'drinks', label: 'Drinks' },
  { id: 'desserts', label: 'Desserts' },
];

const DISCOUNT_OPTIONS: { id: DiscountType; label: string }[] = [
  { id: 'none', label: 'No Discount' },
  { id: 'staff_10', label: 'Staff 10%' },
  { id: 'promo_15', label: 'MELB15 (-15%)' },
  { id: 'promo_10_flat', label: 'FLAME10 (-$10)' },
];

export default function PosTerminalScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  // POS Session State
  const [selectedStoreId, setSelectedStoreId] = useState<string>(STORES_SEED[0].id);
  const [activeCategory, setActiveCategory] = useState<MenuCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderMode, setOrderMode] = useState<OrderMode>('dine_in');
  const [tableOrBuzzer, setTableOrBuzzer] = useState('Table 14');
  const [ticketNumber, setTicketNumber] = useState(104);
  const [ticketItems, setTicketItems] = useState<PosTicketItem[]>([]);
  const [discountType, setDiscountType] = useState<DiscountType>('none');
  const [kitchenNote, setKitchenNote] = useState('');

  // Modals
  const [isStorePickerOpen, setIsStorePickerOpen] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [cashTendered, setCashTendered] = useState<string>('');
  const [completedDocket, setCompletedDocket] = useState<{
    order: OrderRecord;
    mode: OrderMode;
    tableOrBuzzer: string;
    paymentType: 'Cash' | 'EFTPOS Card';
    tendered?: number;
    change?: number;
    ticketNum: number;
  } | null>(null);

  const selectedStore = useMemo(
    () => STORES_SEED.find((s) => s.id === selectedStoreId) || STORES_SEED[0],
    [selectedStoreId]
  );

  const filteredItems = useMemo(() => {
    return MENU_SEED.filter((item) => {
      const matchesCat = activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Add item to POS ticket
  const handleAddItem = (item: MenuItem) => {
    if (!item.available) {
      showToast(`${item.name} is currently 86'd (Sold Out)`, 'error');
      return;
    }

    setTicketItems((prev) => {
      const existingIndex = prev.findIndex((t) => t.item.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      const defaultSize = item.sizes[0] || { label: 'Regular', priceDelta: 0 };
      return [
        ...prev,
        {
          item,
          quantity: 1,
          selectedSizeLabel: defaultSize.label,
          unitPrice: item.price + defaultSize.priceDelta,
        },
      ];
    });
  };

  const handleUpdateQty = (itemId: string, delta: number) => {
    setTicketItems((prev) =>
      prev
        .map((t) => (t.item.id === itemId ? { ...t, quantity: t.quantity + delta } : t))
        .filter((t) => t.quantity > 0)
    );
  };

  const handleClearTicket = () => {
    setTicketItems([]);
    setDiscountType('none');
    setKitchenNote('');
    showToast('POS Ticket cleared', 'info');
  };

  // Financial Calculations (AUD + 10% GST)
  const subtotal = useMemo(
    () => ticketItems.reduce((sum, t) => sum + t.unitPrice * t.quantity, 0),
    [ticketItems]
  );

  const discountAmount = useMemo(() => {
    if (discountType === 'staff_10') return subtotal * 0.1;
    if (discountType === 'promo_15') return subtotal * 0.15;
    if (discountType === 'promo_10_flat') return Math.min(subtotal, 10);
    return 0;
  }, [subtotal, discountType]);

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const gstAmount = taxableAmount * GST_RATE;
  const totalAmount = taxableAmount + gstAmount;
  const totalQty = ticketItems.reduce((acc, t) => acc + t.quantity, 0);

  // Finalize Order
  const handleFinalizeOrder = (
    paymentType: 'Cash' | 'EFTPOS Card',
    tendered?: number,
    change?: number
  ) => {
    if (ticketItems.length === 0) return;

    const currentTicketNum = ticketNumber;
    const orderRecord: OrderRecord = {
      id: `POS-${currentTicketNum}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      status: 'preparing',
      storeId: selectedStore.id,
      storeName: selectedStore.name,
      fulfillment: orderMode === 'drive_thru' ? 'pickup' : 'pickup',
      customerName: `${orderMode.replace('_', ' ').toUpperCase()} (${
        tableOrBuzzer || `#${currentTicketNum}`
      })`,
      customerPhone: selectedStore.phone,
      notes: kitchenNote || `POS ${orderMode.replace('_', ' ').toUpperCase()} Order`,
      subtotal,
      discount: discountAmount,
      deliveryFee: 0,
      gst: gstAmount,
      total: totalAmount,
      paymentMethodLabel: `POS ${paymentType}`,
      items: ticketItems.map((t) => ({
        cartItemId: `${t.item.id}-${Date.now()}-${Math.random()}`,
        itemId: t.item.id,
        name: t.item.name,
        image: t.item.image,
        basePrice: t.item.price,
        selectedSize: { label: t.selectedSizeLabel, priceDelta: 0 },
        selectedAddons: [],
        removedIngredients: [],
        quantity: t.quantity,
        unitPrice: t.unitPrice,
      })),
    };

    dispatch(createOrder(orderRecord));
    setCompletedDocket({
      order: orderRecord,
      mode: orderMode,
      tableOrBuzzer,
      paymentType,
      tendered,
      change,
      ticketNum: currentTicketNum,
    });

    setTicketNumber((prev) => prev + 1);
    setTicketItems([]);
    setDiscountType('none');
    setKitchenNote('');
    setIsCashModalOpen(false);
    setCashTendered('');
    showToast(`Docket #POS-${currentTicketNum} sent to Kitchen Display!`, 'success');
  };

  const numericTendered = parseFloat(cashTendered) || 0;
  const cashChangeDue = Math.max(0, numericTendered - totalAmount);

  const handleShareDocket = async () => {
    if (!completedDocket) return;
    try {
      await Share.share({
        title: `POS Docket #POS-${completedDocket.ticketNum}`,
        message: [
          `SOUTHERN CROSS BURGERS POS`,
          `Kitchen: ${completedDocket.order.storeName}`,
          `Docket: #POS-${completedDocket.ticketNum} (${completedDocket.mode
            .replace('_', ' ')
            .toUpperCase()})`,
          `Table/Buzzer: ${completedDocket.tableOrBuzzer}`,
          `Total (Inc. GST): ${formatAUD(completedDocket.order.total)}`,
          `Paid via: ${completedDocket.paymentType}`,
        ].join('\n'),
      });
    } catch {
      // User dismissed share
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-light dark:bg-surface-dark" edges={['top']}>
      {/* POS Top Bar */}
      <View className="bg-secondary-900 px-4 py-3 border-b border-secondary-800">
        <View className="flex-row items-center justify-between mb-2.5">
          <View className="flex-row items-center gap-2.5">
            <Pressable
              onPress={() => router.back()}
              className="w-9 h-9 rounded-xl bg-secondary-800 items-center justify-center border border-secondary-700"
            >
              <Feather name="arrow-left" size={16} color="#FFFFFF" />
            </Pressable>
            <View>
              <View className="flex-row items-center gap-2">
                <Text className="font-display font-black text-sm text-white uppercase tracking-wider">
                  POS Register
                </Text>
                <View className="bg-primary-600 px-2 py-0.5 rounded-md">
                  <Text className="font-mono font-bold text-[10px] text-white">
                    #POS-{ticketNumber}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => setIsStorePickerOpen(true)}
                className="flex-row items-center gap-1 mt-0.5"
              >
                <View className="w-2 h-2 rounded-full bg-emerald-400" />
                <Text className="font-sans text-xs text-secondary-300 font-semibold">
                  {selectedStore.name} ({selectedStore.suburb})
                </Text>
                <Feather name="chevron-down" size={12} color="#9CA3AF" />
              </Pressable>
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            <ThemeToggle />
          </View>
        </View>

        {/* Mode Selector & Table/Buzzer */}
        <View className="flex-row items-center gap-2">
          <View className="flex-row flex-1 bg-secondary-800 p-1 rounded-xl border border-secondary-700">
            {(
              [
                { id: 'dine_in', label: 'Dine-In', icon: 'coffee' },
                { id: 'takeaway', label: 'Takeaway', icon: 'shopping-bag' },
                { id: 'drive_thru', label: 'Drive-Thru', icon: 'truck' },
              ] as const
            ).map((m) => {
              const active = orderMode === m.id;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => {
                    setOrderMode(m.id);
                    if (m.id === 'dine_in') setTableOrBuzzer('Table 14');
                    if (m.id === 'takeaway') setTableOrBuzzer('Buzzer #8');
                    if (m.id === 'drive_thru') setTableOrBuzzer('Window 1');
                  }}
                  className={`flex-1 flex-row items-center justify-center gap-1 py-1.5 rounded-lg ${
                    active ? 'bg-primary-600' : ''
                  }`}
                >
                  <Feather
                    name={m.icon}
                    size={11}
                    color={active ? '#FFFFFF' : '#9CA3AF'}
                  />
                  <Text
                    className={`font-sans text-[11px] font-bold ${
                      active ? 'text-white' : 'text-secondary-400'
                    }`}
                  >
                    {m.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            value={tableOrBuzzer}
            onChangeText={setTableOrBuzzer}
            placeholder="Table / Buzzer"
            placeholderTextColor="#6B7280"
            className="w-28 bg-secondary-800 border border-secondary-700 rounded-xl px-2.5 py-1.5 font-mono text-xs font-bold text-amber-400 text-center"
          />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Search & Category Filter */}
        <View className="px-4 pt-3 pb-2 bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-800">
          <View className="flex-row items-center bg-secondary-100 dark:bg-secondary-800 rounded-xl px-3 py-2 mb-2.5">
            <Feather name="search" size={15} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Quick search POS menu item or tag..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-2 font-sans text-xs text-secondary-900 dark:text-white py-0.5"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Feather name="x-circle" size={15} color="#9CA3AF" />
              </Pressable>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 6, paddingBottom: 4 }}
          >
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl border ${
                    active
                      ? 'bg-primary-600 border-primary-600'
                      : 'bg-secondary-50 dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700'
                  }`}
                >
                  <Text
                    className={`font-sans text-xs font-bold uppercase tracking-wider ${
                      active ? 'text-white' : 'text-secondary-700 dark:text-secondary-300'
                    }`}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* 1-Tap Menu Grid */}
        <View className="px-4 pt-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-sans text-[11px] font-bold uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
              Tap tile to punch item ({filteredItems.length} items)
            </Text>
            <Text className="font-mono text-[11px] font-bold text-primary-600 dark:text-primary-400">
              {totalQty} in active ticket
            </Text>
          </View>

          <View className="flex-row flex-wrap justify-between">
            {filteredItems.map((item) => {
              const inTicket = ticketItems.find((t) => t.item.id === item.id);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => handleAddItem(item)}
                  disabled={!item.available}
                  style={{ width: '48.5%' }}
                  className={`mb-3 rounded-2xl bg-white dark:bg-secondary-900 border overflow-hidden p-2.5 ${
                    inTicket
                      ? 'border-primary-600 dark:border-primary-500'
                      : 'border-secondary-200 dark:border-secondary-800'
                  } ${!item.available ? 'opacity-50' : ''}`}
                >
                  <View className="flex-row items-center gap-2.5">
                    <Image
                      source={{ uri: item.image }}
                      className="w-12 h-12 rounded-xl bg-secondary-100 dark:bg-secondary-800"
                      resizeMode="cover"
                    />
                    <View className="flex-1">
                      <Text
                        className="font-display font-bold text-xs text-secondary-900 dark:text-white"
                        numberOfLines={2}
                      >
                        {item.name}
                      </Text>
                      <Text className="font-mono font-bold text-xs text-primary-600 dark:text-primary-400 mt-0.5">
                        {formatAUD(item.price)}
                      </Text>
                    </View>
                  </View>

                  {inTicket ? (
                    <View className="mt-2 pt-1.5 border-t border-secondary-100 dark:border-secondary-800 flex-row items-center justify-between">
                      <Text className="font-sans text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        In Ticket: {inTicket.quantity}x
                      </Text>
                      <View className="bg-primary-600 px-2 py-0.5 rounded-md">
                        <Text className="font-mono text-[10px] font-bold text-white">
                          +1 Tap
                        </Text>
                      </View>
                    </View>
                  ) : !item.available ? (
                    <View className="mt-2">
                      <Badge variant="danger" size="sm">
                        86&apos;D / SOLD OUT
                      </Badge>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Active POS Ticket Register */}
        <View className="px-4 mt-2">
          <View className="bg-white dark:bg-secondary-900 rounded-3xl border-2 border-secondary-900 dark:border-secondary-700 overflow-hidden shadow-lg">
            {/* Ticket Header */}
            <View className="bg-secondary-900 px-4 py-3 flex-row items-center justify-between">
              <View>
                <View className="flex-row items-center gap-2">
                  <Text className="font-display font-black text-base text-white">
                    Ticket #POS-{ticketNumber}
                  </Text>
                  <Badge variant="warning" size="sm">
                    {orderMode.replace('_', ' ').toUpperCase()}
                  </Badge>
                </View>
                <Text className="font-mono text-xs text-amber-400 mt-0.5">
                  {tableOrBuzzer || 'Counter Pickup'} • {selectedStore.suburb}
                </Text>
              </View>

              {ticketItems.length > 0 && (
                <Pressable
                  onPress={handleClearTicket}
                  className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-500/20 border border-red-500/40"
                >
                  <Feather name="trash-2" size={13} color="#F87171" />
                  <Text className="font-sans text-xs font-bold text-red-300">Clear</Text>
                </Pressable>
              )}
            </View>

            {/* Ticket Lines */}
            <View className="p-4">
              {ticketItems.length === 0 ? (
                <View className="py-8 items-center">
                  <Feather name="monitor" size={28} color="#9CA3AF" />
                  <Text className="font-display font-bold text-sm text-secondary-700 dark:text-secondary-300 mt-2">
                    No Items Punched Yet
                  </Text>
                  <Text className="font-sans text-xs text-secondary-500 dark:text-secondary-400 mt-1 text-center">
                    Tap any menu tile above to add items to #POS-{ticketNumber}
                  </Text>
                </View>
              ) : (
                <View className="gap-2.5 mb-4">
                  {ticketItems.map((line) => (
                    <View
                      key={line.item.id}
                      className="flex-row items-center justify-between p-2.5 rounded-2xl bg-secondary-50 dark:bg-secondary-800/70 border border-secondary-200 dark:border-secondary-700"
                    >
                      <View className="flex-1 pr-2">
                        <Text className="font-sans font-bold text-xs text-secondary-900 dark:text-white">
                          {line.item.name}
                        </Text>
                        <Text className="font-mono text-[11px] text-secondary-500 dark:text-secondary-400">
                          {formatAUD(line.unitPrice)} each
                        </Text>
                      </View>

                      <View className="flex-row items-center gap-2">
                        <Pressable
                          onPress={() => handleUpdateQty(line.item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 items-center justify-center"
                        >
                          <Feather name="minus" size={13} color="#6B7280" />
                        </Pressable>
                        <Text className="font-mono font-bold text-xs text-secondary-900 dark:text-white w-5 text-center">
                          {line.quantity}
                        </Text>
                        <Pressable
                          onPress={() => handleUpdateQty(line.item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 items-center justify-center"
                        >
                          <Feather name="plus" size={13} color="#6B7280" />
                        </Pressable>

                        <Text className="font-mono font-bold text-xs text-secondary-900 dark:text-white w-16 text-right">
                          {formatAUD(line.unitPrice * line.quantity)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Staff / Promo Discount Bar */}
              <View className="mb-3">
                <Text className="font-sans text-[10px] font-bold uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-1.5">
                  Staff / Promo Discount
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 6 }}
                >
                  {DISCOUNT_OPTIONS.map((d) => {
                    const active = discountType === d.id;
                    return (
                      <Pressable
                        key={d.id}
                        onPress={() => setDiscountType(d.id)}
                        className={`px-3 py-1.5 rounded-xl border ${
                          active
                            ? 'bg-secondary-900 dark:bg-white border-secondary-900 dark:border-white'
                            : 'bg-secondary-50 dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700'
                        }`}
                      >
                        <Text
                          className={`font-sans text-xs font-bold ${
                            active
                              ? 'text-white dark:text-secondary-900'
                              : 'text-secondary-700 dark:text-secondary-300'
                          }`}
                        >
                          {d.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Kitchen Docket Note */}
              <TextInput
                value={kitchenNote}
                onChangeText={setKitchenNote}
                placeholder="Kitchen docket note (e.g. No pickles, allergy alert, extra napkins)..."
                placeholderTextColor="#9CA3AF"
                className="bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-xl px-3 py-2 font-sans text-xs text-secondary-900 dark:text-white mb-4"
              />

              {/* Totals Breakdown */}
              <View className="p-3.5 rounded-2xl bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-200 dark:border-secondary-800 gap-1.5 mb-4">
                <View className="flex-row justify-between">
                  <Text className="font-sans text-xs text-secondary-600 dark:text-secondary-400">
                    Subtotal ({totalQty} items)
                  </Text>
                  <Text className="font-mono text-xs font-semibold text-secondary-900 dark:text-white">
                    {formatAUD(subtotal)}
                  </Text>
                </View>
                {discountAmount > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="font-sans text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      POS Discount
                    </Text>
                    <Text className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      -{formatAUD(discountAmount)}
                    </Text>
                  </View>
                )}
                <View className="flex-row justify-between">
                  <Text className="font-sans text-xs text-secondary-600 dark:text-secondary-400">
                    GST (10% AU Tax)
                  </Text>
                  <Text className="font-mono text-xs font-semibold text-secondary-900 dark:text-white">
                    {formatAUD(gstAmount)}
                  </Text>
                </View>
                <View className="flex-row justify-between pt-2 mt-1 border-t border-secondary-200 dark:border-secondary-700">
                  <Text className="font-display font-black text-base text-secondary-900 dark:text-white">
                    Total Due (AUD)
                  </Text>
                  <Text className="font-mono font-black text-xl text-primary-600 dark:text-primary-400">
                    {formatAUD(totalAmount)}
                  </Text>
                </View>
              </View>

              {/* Tender Action Buttons */}
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Button
                    variant="secondary"
                    fullWidth
                    disabled={ticketItems.length === 0}
                    onPress={() => {
                      setCashTendered(Math.ceil(totalAmount).toString());
                      setIsCashModalOpen(true);
                    }}
                    leftIcon={<Feather name="dollar-sign" size={16} color="#FFFFFF" />}
                  >
                    Cash Tender
                  </Button>
                </View>
                <View className="flex-1">
                  <Button
                    variant="primary"
                    fullWidth
                    disabled={ticketItems.length === 0}
                    onPress={() => handleFinalizeOrder('EFTPOS Card')}
                    leftIcon={<Feather name="credit-card" size={16} color="#FFFFFF" />}
                  >
                    Charge EFTPOS
                  </Button>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Store Selector Sheet */}
      <BottomSheetModal
        visible={isStorePickerOpen}
        onClose={() => setIsStorePickerOpen(false)}
        title="Select POS Kitchen Terminal"
        subtitle="Switch active Melbourne counter register"
      >
        <View className="gap-2.5 py-2">
          {STORES_SEED.map((st) => {
            const active = st.id === selectedStoreId;
            return (
              <Pressable
                key={st.id}
                onPress={() => {
                  setSelectedStoreId(st.id);
                  setIsStorePickerOpen(false);
                  showToast(`POS switched to ${st.name}`, 'info');
                }}
                className={`p-3.5 rounded-2xl border flex-row items-center justify-between ${
                  active
                    ? 'bg-primary-50/70 dark:bg-primary-950/30 border-primary-600'
                    : 'bg-white dark:bg-secondary-900 border-secondary-200 dark:border-secondary-800'
                }`}
              >
                <View>
                  <Text className="font-display font-bold text-sm text-secondary-900 dark:text-white">
                    {st.name}
                  </Text>
                  <Text className="font-sans text-xs text-secondary-500 dark:text-secondary-400">
                    {st.address}, {st.suburb}
                  </Text>
                </View>
                {active && <Feather name="check-circle" size={18} color="#D9381E" />}
              </Pressable>
            );
          })}
        </View>
      </BottomSheetModal>

      {/* Cash Tender Calculator Modal */}
      <BottomSheetModal
        visible={isCashModalOpen}
        onClose={() => setIsCashModalOpen(false)}
        title="Cash Tender Calculator"
        subtitle={`Ticket #POS-${ticketNumber} • Total Due ${formatAUD(totalAmount)}`}
      >
        <View className="py-2 gap-4">
          <View className="p-4 rounded-2xl bg-secondary-50 dark:bg-secondary-800 flex-row items-center justify-between">
            <Text className="font-sans text-sm font-bold text-secondary-600 dark:text-secondary-300">
              Amount Due
            </Text>
            <Text className="font-mono font-black text-2xl text-primary-600 dark:text-primary-400">
              {formatAUD(totalAmount)}
            </Text>
          </View>

          <View>
            <Text className="font-sans text-xs font-bold uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-2">
              Quick AUD Notes
            </Text>
            <View className="flex-row gap-2">
              {[
                Math.ceil(totalAmount),
                20,
                50,
                100,
              ].map((amt, idx) => (
                <Pressable
                  key={`${amt}-${idx}`}
                  onPress={() => setCashTendered(amt.toString())}
                  className="flex-1 py-2.5 rounded-xl bg-secondary-100 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 items-center"
                >
                  <Text className="font-mono font-bold text-xs text-secondary-900 dark:text-white">
                    ${amt}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View>
            <Text className="font-sans text-xs font-bold uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-1.5">
              Cash Tendered ($ AUD)
            </Text>
            <TextInput
              value={cashTendered}
              onChangeText={setCashTendered}
              keyboardType="decimal-pad"
              placeholder="0.00"
              className="bg-white dark:bg-secondary-900 border-2 border-secondary-300 dark:border-secondary-700 rounded-2xl px-4 py-3 font-mono font-black text-xl text-secondary-900 dark:text-white"
            />
          </View>

          <View className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex-row items-center justify-between">
            <Text className="font-sans text-sm font-bold text-emerald-800 dark:text-emerald-300">
              Change Due to Customer
            </Text>
            <Text className="font-mono font-black text-2xl text-emerald-600 dark:text-emerald-400">
              {formatAUD(cashChangeDue)}
            </Text>
          </View>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={numericTendered < totalAmount}
            onPress={() =>
              handleFinalizeOrder('Cash', numericTendered, cashChangeDue)
            }
            leftIcon={<Feather name="check-circle" size={18} color="#FFFFFF" />}
          >
            Complete Cash Sale & Print Docket
          </Button>
        </View>
      </BottomSheetModal>

      {/* Thermal Kitchen Docket Modal */}
      <BottomSheetModal
        visible={!!completedDocket}
        onClose={() => setCompletedDocket(null)}
        title="Kitchen Thermal Docket"
        subtitle="Dispatched to Kitchen Display & Live Admin Feed"
        footer={
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                variant="outline"
                fullWidth
                onPress={handleShareDocket}
                leftIcon={<Feather name="printer" size={16} color="#D9381E" />}
              >
                Print / Share
              </Button>
            </View>
            <View className="flex-1">
              <Button
                variant="primary"
                fullWidth
                onPress={() => setCompletedDocket(null)}
              >
                Next Customer
              </Button>
            </View>
          </View>
        }
      >
        {completedDocket && (
          <View className="p-4 my-2 rounded-2xl bg-amber-50/70 dark:bg-secondary-800 border border-dashed border-secondary-300 dark:border-secondary-600">
            <View className="items-center border-b border-dashed border-secondary-300 dark:border-secondary-700 pb-3 mb-3">
              <Text className="font-mono font-black text-base text-secondary-900 dark:text-white">
                *** KITCHEN DOCKET #POS-{completedDocket.ticketNum} ***
              </Text>
              <Text className="font-mono text-xs text-secondary-600 dark:text-secondary-300 mt-0.5">
                {completedDocket.order.storeName}
              </Text>
              <View className="mt-2 px-3 py-1 rounded-lg bg-secondary-900">
                <Text className="font-mono font-bold text-xs text-amber-400">
                  {completedDocket.mode.replace('_', ' ').toUpperCase()} •{' '}
                  {completedDocket.tableOrBuzzer}
                </Text>
              </View>
            </View>

            <View className="gap-2 border-b border-dashed border-secondary-300 dark:border-secondary-700 pb-3 mb-3">
              {completedDocket.order.items.map((item) => (
                <View
                  key={item.cartItemId}
                  className="flex-row items-center justify-between"
                >
                  <Text className="font-mono font-bold text-xs text-secondary-900 dark:text-white">
                    {item.quantity}x {item.name}
                  </Text>
                  <Text className="font-mono text-xs text-secondary-700 dark:text-secondary-300">
                    {formatAUD(item.unitPrice * item.quantity)}
                  </Text>
                </View>
              ))}
            </View>

            {completedDocket.order.notes && (
              <View className="mb-3 p-2.5 rounded-xl bg-amber-100/80 dark:bg-amber-950/40">
                <Text className="font-mono font-bold text-xs text-amber-900 dark:text-amber-300">
                  NOTE: {completedDocket.order.notes}
                </Text>
              </View>
            )}

            <View className="gap-1">
              <View className="flex-row justify-between">
                <Text className="font-mono text-xs text-secondary-600 dark:text-secondary-400">
                  GST (10% Included)
                </Text>
                <Text className="font-mono text-xs text-secondary-900 dark:text-white">
                  {formatAUD(completedDocket.order.gst)}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="font-mono font-black text-sm text-secondary-900 dark:text-white">
                  TOTAL PAID ({completedDocket.paymentType})
                </Text>
                <Text className="font-mono font-black text-sm text-primary-600 dark:text-primary-400">
                  {formatAUD(completedDocket.order.total)}
                </Text>
              </View>
              {completedDocket.paymentType === 'Cash' &&
                completedDocket.tendered !== undefined && (
                  <View className="flex-row justify-between mt-1 pt-1 border-t border-dashed border-secondary-300 dark:border-secondary-700">
                    <Text className="font-mono text-xs text-secondary-600 dark:text-secondary-400">
                      Tendered: {formatAUD(completedDocket.tendered)}
                    </Text>
                    <Text className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                      Change: {formatAUD(completedDocket.change || 0)}
                    </Text>
                  </View>
                )}
            </View>
          </View>
        )}
      </BottomSheetModal>
    </SafeAreaView>
  );
}
