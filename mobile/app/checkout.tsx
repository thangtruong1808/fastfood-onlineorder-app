import { useRouter } from 'expo-router';
import {
  AlertCircle,
  ArrowLeft,
  Bike,
  Check,
  Clock,
  CreditCard,
  Lock,
  MapPin,
  ShieldCheck,
  Sparkles,
  Store as StoreIcon,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useToast } from '@/components/common/ToastProvider';
import { Badge } from '@/components/ui/Badge';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { MELBOURNE_STORES } from '@/data/storesSeed';
import { addLoyaltyPoints } from '@/features/auth-mock/authSlice';
import { calculateCartTotals } from '@/features/cart/cartSelectors';
import { clearCart } from '@/features/cart/cartSlice';
import { createOrder } from '@/features/orders/ordersSlice';
import { setStoreModalOpen } from '@/features/stores/storeSlice';
import { useTheme } from '@/hooks/useTheme';
import { formatAUD } from '@/lib/currency';
import {
  getPaymentAdapter,
  TEST_CARDS,
  type ChallengeDetails,
} from '@/services/payment';
import { FULFILLMENT_MODES, type OrderRecord } from '@/types';

const TIME_SLOTS = [
  'ASAP (~15–20 mins)',
  'In 30 mins',
  'In 45 mins',
  'In 60 mins',
  'Today at 6:00 PM',
  'Today at 6:30 PM',
  'Today at 7:00 PM',
  'Today at 7:30 PM',
];

function generateOrderNumber(): string {
  return `SCB-${Math.floor(1000 + Math.random() * 9000)}`;
}

function getEstimatedReadyTime(minutes = 20): string {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

export default function CheckoutScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { showToast } = useToast();

  const { items, promoCode } = useAppSelector((state) => state.cart);
  const {
    selectedStoreId,
    fulfillmentMode,
    deliveryAddress,
    deliverySuburb,
    deliveryPostcode,
  } = useAppSelector((state) => state.store);
  const { currentUser } = useAppSelector((state) => state.auth);

  const activeStore =
    MELBOURNE_STORES.find((s) => s.id === selectedStoreId) ?? MELBOURNE_STORES[0];

  const totals = calculateCartTotals({
    items,
    promoCode,
    fulfillmentMode,
    selectedStoreId,
  });

  // Contact Form State
  const [customerName, setCustomerName] = useState(currentUser.name || 'Alex Mercer');
  const [customerEmail, setCustomerEmail] = useState(
    currentUser.email || 'alex.mercer@melbmail.com.au',
  );
  const [customerPhone, setCustomerPhone] = useState(
    currentUser.phone || '0412 389 441',
  );
  const [deliveryNotes, setDeliveryNotes] = useState('Leave on porch / ring doorbell');
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);

  // Payment Form State
  const [cardNumber, setCardNumber] = useState<string>(TEST_CARDS.SUCCESS.number);
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('789');
  const [cardholderName, setCardholderName] = useState(customerName);

  // Flow & 3DS Modal States
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [threeDsModalOpen, setThreeDsModalOpen] = useState(false);
  const [threeDsDetails, setThreeDsDetails] = useState<ChallengeDetails | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [pendingOrderRecord, setPendingOrderRecord] = useState<OrderRecord | null>(null);

  const activeAdapter = getPaymentAdapter();
  const earnedPoints = Math.round(totals.total * 10);

  if (items.length === 0 && !pendingOrderRecord) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bgPrimary,
          paddingTop: insets.top + 12,
          paddingHorizontal: 16,
        }}
      >
        <View style={{ marginBottom: 16 }}>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft size={14} color={colors.textPrimary} />}
            onPress={() => router.back()}
          >
            Back
          </Button>
        </View>
        <EmptyState
          icon={<CreditCard size={28} color={colors.brandPrimary} />}
          title="Your Order Bag is Empty"
          description="Add some flame-grilled burgers or crispy chicken to proceed through checkout."
          actionLabel="Explore Melbourne Menu"
          onAction={() => router.replace('/(tabs)/menu')}
        />
      </View>
    );
  }

  const formatCardInput = (val: string) => {
    const raw = val.replace(/\D/g, '').substring(0, 16);
    const parts = raw.match(/.{1,4}/g);
    return parts ? parts.join(' ') : raw;
  };

  const handleSelectDemoCard = (cardNum: string) => {
    setCardNumber(cardNum);
    setErrorMessage(null);
  };

  const finalizeOrder = (order: OrderRecord) => {
    dispatch(createOrder(order));
    dispatch(clearCart());
    dispatch(addLoyaltyPoints(order.loyaltyPointsEarned));

    showToast({
      title: `Order #${order.orderNumber} Confirmed!`,
      description: `Earned +${order.loyaltyPointsEarned} Flame Points • Sent to ${order.storeSuburb} Kitchen.`,
      tone: 'success',
    });

    router.replace(`/tracking/${order.id}`);
  };

  const handleSubmitPayment = async () => {
    setErrorMessage(null);

    if (!customerName.trim() || !customerEmail.trim()) {
      setErrorMessage('Please provide your full name and email address.');
      return;
    }

    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 8) {
      setErrorMessage('Please enter a valid Australian mobile phone number.');
      return;
    }

    setIsProcessing(true);

    const orderNumber = generateOrderNumber();
    const orderId = `ord-${orderNumber.toLowerCase()}`;

    const orderRecord: OrderRecord = {
      id: orderId,
      orderNumber,
      createdAt: new Date().toISOString(),
      estimatedReadyAt: getEstimatedReadyTime(20),
      status: 'received',
      fulfillmentMode,
      storeId: activeStore.id,
      storeName: activeStore.name,
      storeSuburb: activeStore.suburb,
      deliveryAddress:
        fulfillmentMode === 'delivery'
          ? `${deliveryAddress}, ${deliverySuburb} VIC ${deliveryPostcode}`
          : undefined,
      scheduledSlot: selectedSlot,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      items: [...items],
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      promoCode: promoCode || undefined,
      deliveryFee: totals.deliveryFee,
      gstIncluded: totals.gstIncluded,
      total: totals.total,
      paymentMethodLabel: `Test Card (•••• ${cardNumber.replace(/\s+/g, '').slice(-4) || '4242'})`,
      loyaltyPointsEarned: earnedPoints,
    };

    try {
      const result = await activeAdapter.processPayment({
        amountAUD: totals.total,
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        cardNumber,
        cardExpiry,
        cardCvc,
        cardholderName,
      });

      if (result.status === 'requires_action' && result.challengeDetails) {
        setIsProcessing(false);
        setPendingOrderRecord(orderRecord);
        setThreeDsDetails(result.challengeDetails);
        setOtpInput(result.challengeDetails.challengeCode);
        setThreeDsModalOpen(true);
        return;
      }

      if (!result.success) {
        setIsProcessing(false);
        setErrorMessage(result.errorMessage || 'Transaction could not be completed.');
        return;
      }

      setIsProcessing(false);
      finalizeOrder(orderRecord);
    } catch (err) {
      setIsProcessing(false);
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected payment error occurred.',
      );
    }
  };

  const handleVerify3DS = () => {
    if (!pendingOrderRecord) return;
    if (otpInput.trim() !== (threeDsDetails?.challengeCode ?? '884210')) {
      showToast({
        title: 'Invalid 3DS Code',
        description: `Enter demo verification code ${threeDsDetails?.challengeCode ?? '884210'}`,
        tone: 'error',
      });
      return;
    }
    setThreeDsModalOpen(false);
    finalizeOrder(pendingOrderRecord);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{
        flex: 1,
        backgroundColor: colors.bgPrimary,
        paddingTop: insets.top,
      }}
    >
      {/* Top Sticky Bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: colors.bgSurface,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderSubtle,
        }}
      >
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft size={14} color={colors.textPrimary} />}
          onPress={() => router.back()}
        >
          Back
        </Button>

        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '900' }}>
            Melbourne Checkout
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '700' }}>
            {activeAdapter.name} • Test Mode
          </Text>
        </View>

        <Badge tone="brand">AUD ($)</Badge>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 44, gap: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Fulfillment & Melbourne Kitchen Card */}
        <Card style={{ gap: 12 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {fulfillmentMode === FULFILLMENT_MODES.PICKUP ? (
                <StoreIcon size={18} color={colors.brandPrimary} />
              ) : (
                <Bike size={18} color={colors.brandPrimary} />
              )}
              <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '800' }}>
                1. Fulfillment & Melbourne Kitchen
              </Text>
            </View>

            <Button
              variant="outline"
              size="sm"
              onPress={() => dispatch(setStoreModalOpen(true))}
            >
              Change
            </Button>
          </View>

          <View
            style={{
              backgroundColor: colors.bgElevated,
              borderRadius: 14,
              padding: 12,
              gap: 4,
            }}
          >
            <Badge tone="brand">
              {fulfillmentMode === FULFILLMENT_MODES.PICKUP
                ? `Click & Collect Pickup (~${activeStore.pickupEtaMinutes}m)`
                : `Melbourne Suburb Delivery (~${activeStore.deliveryEtaMinutes}m)`}
            </Badge>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 14,
                fontWeight: '800',
                marginTop: 4,
              }}
            >
              {activeStore.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MapPin size={12} color={colors.textMuted} />
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                {fulfillmentMode === FULFILLMENT_MODES.PICKUP
                  ? `${activeStore.address} (${activeStore.postcode})`
                  : `Delivering to: ${deliveryAddress}, ${deliverySuburb} VIC ${deliveryPostcode}`}
              </Text>
            </View>
          </View>

          {/* Time Slot Selector */}
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Clock size={14} color={colors.brandSecondary} />
              <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '800' }}>
                Scheduled Collection / Delivery Time
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {TIME_SLOTS.map((slot) => {
                const isSelected = selectedSlot === slot;
                return (
                  <Pressable
                    key={slot}
                    onPress={() => setSelectedSlot(slot)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: isSelected ? colors.brandPrimary : colors.borderSubtle,
                      backgroundColor: isSelected ? colors.bgElevated : colors.bgSurface,
                    }}
                  >
                    <Text
                      style={{
                        color: isSelected ? colors.brandPrimary : colors.textSecondary,
                        fontSize: 12,
                        fontWeight: '800',
                      }}
                    >
                      {slot}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Card>

        {/* 2. Customer Contact Details */}
        <Card style={{ gap: 12 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '800' }}>
            2. Contact Details
          </Text>

          <Input
            label="Full Name"
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Alex Mercer"
          />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Input
                label="Australian Mobile"
                value={customerPhone}
                onChangeText={setCustomerPhone}
                keyboardType="phone-pad"
                placeholder="0412 389 441"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Receipt Email"
                value={customerEmail}
                onChangeText={setCustomerEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="alex@melbmail.com.au"
              />
            </View>
          </View>

          {fulfillmentMode === FULFILLMENT_MODES.DELIVERY ? (
            <Input
              label="Courier Drop-off Instructions"
              value={deliveryNotes}
              onChangeText={setDeliveryNotes}
              placeholder="e.g. Buzz #302 at timber gate"
            />
          ) : null}
        </Card>

        {/* 3. Stripe Test Mode & Interactive Test Card Switcher */}
        <Card style={{ gap: 14 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <CreditCard size={18} color={colors.brandPrimary} />
              <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '800' }}>
                3. Payment (Stripe Test Mode)
              </Text>
            </View>
            <Badge tone="amber">TEST MODE ONLY</Badge>
          </View>

          {/* Interactive Test Card Presets */}
          <View
            style={{
              backgroundColor: colors.bgElevated,
              borderRadius: 16,
              padding: 12,
              gap: 8,
              borderWidth: 1,
              borderColor: colors.borderSubtle,
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '800' }}>
              TAP A DEMO TEST CARD TO SIMULATE OUTCOMES:
            </Text>

            {Object.entries(TEST_CARDS).map(([key, card]) => {
              const isSelected =
                cardNumber.replace(/\s+/g, '') === card.number.replace(/\s+/g, '');
              return (
                <Pressable
                  key={key}
                  onPress={() => handleSelectDemoCard(card.number)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 10,
                    borderRadius: 12,
                    borderWidth: isSelected ? 1.5 : 1,
                    borderColor: isSelected ? colors.brandPrimary : colors.borderSubtle,
                    backgroundColor: colors.bgSurface,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: isSelected ? colors.brandPrimary : colors.textPrimary,
                        fontSize: 12,
                        fontWeight: '800',
                      }}
                    >
                      {card.label} ({card.number.slice(-4)})
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                      {card.outcome}
                    </Text>
                  </View>
                  {isSelected ? (
                    <Check size={16} color={colors.brandPrimary} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          {/* Card Details Form */}
          <Input
            label="Card Number (Test Mode)"
            value={cardNumber}
            onChangeText={(v) => setCardNumber(formatCardInput(v))}
            keyboardType="number-pad"
            leftIcon={<Lock size={15} color={colors.textMuted} />}
          />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Input
                label="Expiry (MM/YY)"
                value={cardExpiry}
                onChangeText={setCardExpiry}
                placeholder="12/28"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="CVC"
                value={cardCvc}
                onChangeText={setCardCvc}
                keyboardType="number-pad"
                placeholder="789"
              />
            </View>
          </View>

          <Input
            label="Name on Card"
            value={cardholderName}
            onChangeText={setCardholderName}
            placeholder="Alex Mercer"
          />

          {errorMessage ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                backgroundColor: 'rgba(185, 28, 28, 0.12)',
                borderColor: colors.statusDanger,
                borderWidth: 1,
                borderRadius: 12,
                padding: 12,
              }}
            >
              <AlertCircle size={18} color={colors.statusDanger} />
              <Text
                style={{
                  flex: 1,
                  color: colors.statusDanger,
                  fontSize: 12,
                  fontWeight: '700',
                }}
              >
                {errorMessage}
              </Text>
            </View>
          ) : null}
        </Card>

        {/* 4. Final AUD & 10% GST Summary */}
        <Card style={{ gap: 10 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '800' }}>
            4. Order Total & GST Breakdown
          </Text>

          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                Items Subtotal ({totals.itemsCount})
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '700' }}>
                {formatAUD(totals.subtotal)}
              </Text>
            </View>

            {totals.discountAmount > 0 ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text
                  style={{ color: colors.statusSuccess, fontSize: 13, fontWeight: '700' }}
                >
                  Promo Discount ({totals.appliedPromo?.code})
                </Text>
                <Text
                  style={{ color: colors.statusSuccess, fontSize: 13, fontWeight: '800' }}
                >
                  -{formatAUD(totals.discountAmount)}
                </Text>
              </View>
            ) : null}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                {fulfillmentMode === 'pickup' ? 'Counter Pickup' : 'Melbourne Delivery'}
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '700' }}>
                {totals.deliveryFee === 0 ? 'FREE' : formatAUD(totals.deliveryFee)}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                Includes 10% Australian GST
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                {formatAUD(totals.gstIncluded)}
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                paddingTop: 8,
                borderTopWidth: 1,
                borderTopColor: colors.borderSubtle,
              }}
            >
              <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '900' }}>
                Total Due (AUD)
              </Text>
              <Text
                style={{
                  color: colors.brandPrimary,
                  fontSize: 22,
                  fontWeight: '900',
                }}
              >
                {formatAUD(totals.total)}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: colors.bgElevated,
              borderRadius: 12,
              padding: 10,
            }}
          >
            <Sparkles size={15} color={colors.brandSecondary} />
            <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '700' }}>
              You will earn +{earnedPoints} Flame Rewards Points on this order!
            </Text>
          </View>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isProcessing}
            leftIcon={<ShieldCheck size={17} color="#FFFFFF" />}
            onPress={handleSubmitPayment}
          >
            Authorize & Place Order • {formatAUD(totals.total)}
          </Button>
        </Card>
      </ScrollView>

      {/* 3D Secure 2.0 SMS OTP Challenge Sheet */}
      <BottomSheetModal
        open={threeDsModalOpen}
        onOpenChange={setThreeDsModalOpen}
        title="3D Secure 2.0 Verification"
        subtitle={threeDsDetails?.bankName ?? 'Melbourne Commonwealth Bank • SecureCode'}
        footer={
          <Button variant="primary" size="lg" fullWidth onPress={handleVerify3DS}>
            Verify OTP & Authorize {formatAUD(totals.total)}
          </Button>
        }
      >
        <View style={{ gap: 14 }}>
          <View
            style={{
              backgroundColor: colors.bgElevated,
              borderRadius: 16,
              padding: 14,
              gap: 6,
            }}
          >
            <Badge tone="amber">SMS One-Time Passcode Sent</Badge>
            <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '700' }}>
              We sent a 6-digit verification code to mobile ending in ••••{' '}
              {threeDsDetails?.lastFourPhone ?? '4410'}.
            </Text>
            <Text style={{ color: colors.brandPrimary, fontSize: 12, fontWeight: '800' }}>
              Demo Hint: Use OTP code {threeDsDetails?.challengeCode ?? '884210'}
            </Text>
          </View>

          <Input
            label="Enter 6-Digit SMS Code"
            value={otpInput}
            onChangeText={setOtpInput}
            keyboardType="number-pad"
            placeholder="884210"
          />
        </View>
      </BottomSheetModal>
    </KeyboardAvoidingView>
  );
}
