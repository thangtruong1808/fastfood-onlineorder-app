import {
  AlertCircle,
  ArrowLeft,
  Bike,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Lock,
  MapPin,
  ShieldCheck,
  Sparkles,
  Store as StoreIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { MELBOURNE_STORES } from '@/data/storesSeed';
import { addLoyaltyPoints } from '@/features/auth-mock/authSlice';
import { calculateCartTotals } from '@/features/cart/cartSelectors';
import { clearCart } from '@/features/cart/cartSlice';
import { createOrder } from '@/features/orders/ordersSlice';
import { setStoreModalOpen } from '@/features/stores/storeSlice';
import { cn } from '@/lib/cn';
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

export default function CheckoutShellPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { items, promoCode } = useAppSelector((state) => state.cart);
  const { selectedStoreId, fulfillmentMode, deliveryAddress, deliverySuburb, deliveryPostcode } =
    useAppSelector((state) => state.store);
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
  const [customerEmail, setCustomerEmail] = useState(currentUser.email || 'alex.mercer@melbmail.com.au');
  const [customerPhone, setCustomerPhone] = useState(currentUser.phone || '0412 389 441');
  const [deliveryNotes, setDeliveryNotes] = useState('Leave on porch / ring doorbell');
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);

  // Payment Form State
  const [cardNumber, setCardNumber] = useState<string>(TEST_CARDS.SUCCESS.number);
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('789');
  const [cardholderName, setCardholderName] = useState(customerName);

  // Flow & Modal States
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [threeDsModalOpen, setThreeDsModalOpen] = useState(false);
  const [threeDsDetails, setThreeDsDetails] = useState<ChallengeDetails | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [pendingOrderRecord, setPendingOrderRecord] = useState<OrderRecord | null>(null);

  // If cart is completely empty, provide redirect CTA
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-primary/10 text-brand-primary">
          <CreditCard className="h-8 w-8" />
        </div>
        <h1 className="font-display text-2xl font-bold">Your Bag is Empty</h1>
        <p className="text-sm text-text-secondary">
          Add some delicious flame-grilled burgers or crispy chicken to proceed through checkout.
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/menu')}
          className="shadow-md"
        >
          Explore Melbourne Menu
        </Button>
      </div>
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

    toast.success('Payment authorized & order placed!', {
      description: `Order #${order.orderNumber} confirmed. Earned +${order.loyaltyPointsEarned} Flame Points!`,
    });

    navigate(`/orders/${order.id}`);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!customerName.trim() || !customerEmail.trim()) {
      setErrorMessage('Please provide your name and email address.');
      return;
    }

    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 8) {
      setErrorMessage('Please enter a valid Australian mobile phone number.');
      return;
    }

    setIsProcessing(true);

    const orderNumber = generateOrderNumber();
    const orderId = `ord-${orderNumber.toLowerCase()}`;
    const earnedPoints = Math.round(totals.total * 10);

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
      customerName,
      customerPhone,
      customerEmail,
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
      const adapter = getPaymentAdapter();
      const result = await adapter.processPayment({
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

      // Success
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
    setThreeDsModalOpen(false);
    finalizeOrder(pendingOrderRecord);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* Top Header & Back Button */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border-subtle pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="brand">Step 2 of 2 • Checkout</Badge>
            <span className="text-xs text-text-muted">Safe Test Mode Simulator</span>
          </div>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
            Checkout &amp; Payment
          </h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate('/menu')}
        >
          Back to Menu
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Form: Fulfillment, Contact & Payment (8 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* 1. Fulfillment Confirmation Card */}
          <Card className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary text-white">
                  {fulfillmentMode === FULFILLMENT_MODES.PICKUP ? (
                    <StoreIcon className="h-4 w-4" />
                  ) : (
                    <Bike className="h-4 w-4" />
                  )}
                </span>
                <div>
                  <h2 className="font-display text-base font-bold text-text-primary">
                    1. Fulfillment Method
                  </h2>
                  <p className="text-xs text-text-secondary">
                    {fulfillmentMode === FULFILLMENT_MODES.PICKUP
                      ? 'Express Click & Collect • Melbourne Kitchen'
                      : 'Contactless Delivery across Melbourne'}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => dispatch(setStoreModalOpen(true))}
              >
                Change
              </Button>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-bg-elevated/60 p-4 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-text-primary">
                <span>{activeStore.name}</span>
                <span className="text-brand-primary">
                  {fulfillmentMode === FULFILLMENT_MODES.PICKUP
                    ? `Ready in ~${activeStore.pickupEtaMinutes}m`
                    : `ETA ~${activeStore.deliveryEtaMinutes}m`}
                </span>
              </div>
              <p className="text-text-secondary">{activeStore.address}</p>
              {fulfillmentMode === 'delivery' && (
                <div className="border-t border-border-subtle pt-2 text-text-primary">
                  <span className="font-bold">Delivering to: </span>
                  <span>{deliveryAddress}, {deliverySuburb} VIC {deliveryPostcode}</span>
                </div>
              )}
            </div>

            {/* Time Slot Picker */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-brand-primary" />
                <span>Preferred Preparation Time</span>
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {TIME_SLOTS.slice(0, 4).map((slot) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={cn(
                        'rounded-xl border p-2.5 text-center text-xs font-bold transition-all cursor-pointer',
                        isSelected
                          ? 'border-brand-primary bg-brand-primary text-white shadow-xs'
                          : 'border-border-subtle bg-bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary',
                      )}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* 2. Contact Details Form */}
          <Card className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-bg-elevated text-text-primary border border-border-subtle">
                <MapPin className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-display text-base font-bold text-text-primary">
                  2. Contact &amp; Notification Details
                </h2>
                <p className="text-xs text-text-secondary">
                  We will send your order confirmation and live kitchen tracking link here.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                id="contact-name"
                label="Full Name"
                placeholder="e.g. Alex Mercer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
              <Input
                id="contact-email"
                type="email"
                label="Email Address"
                placeholder="alex.mercer@melbmail.com.au"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                id="contact-phone"
                type="tel"
                label="Australian Mobile Number"
                placeholder="0412 389 441"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />
              <Input
                id="contact-notes"
                label="Kitchen / Courier Notes"
                placeholder="e.g. Buzz Apt 3B, leave at front door"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
              />
            </div>
          </Card>

          {/* 3. Payment Form & Demo Test Mode Simulator */}
          <Card className="p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary text-white">
                  <CreditCard className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-display text-base font-bold text-text-primary">
                    3. Payment Information
                  </h2>
                  <p className="text-xs text-text-secondary">
                    Card payment simulation with Stripe test credit card numbers.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <Lock className="h-3.5 w-3.5" />
                <span>256-Bit Encrypted</span>
              </div>
            </div>

            {/* Test Mode Interactive Card Selector Pills */}
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/8 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  ⚡ Test Card Simulator (Click to Test Outcomes)
                </span>
                <span className="text-[10px] text-amber-700 dark:text-amber-400">No Real Charge</span>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => handleSelectDemoCard(TEST_CARDS.SUCCESS.number)}
                  className={cn(
                    'flex flex-col items-start rounded-xl border p-2.5 text-left transition-all cursor-pointer',
                    cardNumber.replace(/\s+/g, '') === TEST_CARDS.SUCCESS.number.replace(/\s+/g, '')
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500'
                      : 'border-border-subtle bg-bg-surface hover:border-emerald-500/50',
                  )}
                >
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Success (4242)</span>
                  </span>
                  <span className="mt-1 font-mono text-[11px] text-text-muted">4242 •••• 4242</span>
                  <span className="text-[10px] text-text-secondary">Instant Approved</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectDemoCard(TEST_CARDS.THREE_DS.number)}
                  className={cn(
                    'flex flex-col items-start rounded-xl border p-2.5 text-left transition-all cursor-pointer',
                    cardNumber.replace(/\s+/g, '') === TEST_CARDS.THREE_DS.number.replace(/\s+/g, '')
                      ? 'border-amber-500 bg-amber-500/15 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500'
                      : 'border-border-subtle bg-bg-surface hover:border-amber-500/50',
                  )}
                >
                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>3D Secure (3155)</span>
                  </span>
                  <span className="mt-1 font-mono text-[11px] text-text-muted">4000 •••• 3155</span>
                  <span className="text-[10px] text-text-secondary">SMS OTP Challenge</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectDemoCard(TEST_CARDS.DECLINED.number)}
                  className={cn(
                    'flex flex-col items-start rounded-xl border p-2.5 text-left transition-all cursor-pointer',
                    cardNumber.replace(/\s+/g, '') === TEST_CARDS.DECLINED.number.replace(/\s+/g, '')
                      ? 'border-rose-500 bg-rose-500/15 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500'
                      : 'border-border-subtle bg-bg-surface hover:border-rose-500/50',
                  )}
                >
                  <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Decline (0002)</span>
                  </span>
                  <span className="mt-1 font-mono text-[11px] text-text-muted">4000 •••• 0002</span>
                  <span className="text-[10px] text-text-secondary">Simulates Decline</span>
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-800 dark:text-rose-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Credit Card Inputs */}
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <Input
                id="card-number"
                label="Card Number"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardInput(e.target.value))}
                placeholder="4242 4242 4242 4242"
                leftIcon={<CreditCard className="h-4 w-4" />}
                required
              />

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Input
                  id="card-expiry"
                  label="Expires"
                  placeholder="MM/YY"
                  maxLength={5}
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  required
                />
                <Input
                  id="card-cvc"
                  label="CVC / CVV"
                  placeholder="123"
                  maxLength={4}
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  required
                />
                <div className="col-span-2 sm:col-span-1">
                  <Input
                    id="card-name"
                    label="Name on Card"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isProcessing}
                className="w-full text-base font-bold shadow-elevated"
                leftIcon={<Lock className="h-4 w-4" />}
              >
                {isProcessing
                  ? 'Authorizing with Melbourne Gateway...'
                  : `Authorize & Pay ${formatAUD(totals.total)} AUD`}
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Side: Order Summary Card (4 cols) */}
        <div className="space-y-6 lg:col-span-5">
          <Card className="sticky top-24 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h2 className="font-display text-lg font-bold text-text-primary">
                Order Summary
              </h2>
              <Badge tone="brand">{totals.itemsCount} Items</Badge>
            </div>

            {/* Line items list */}
            <div className="max-h-72 overflow-y-auto space-y-3 pr-1 divide-y divide-border-subtle">
              {items.map((item) => (
                <div key={item.cartItemId} className="pt-3 first:pt-0 space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-text-primary">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>{formatAUD(item.unitPrice * item.quantity)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 text-[10px] text-text-muted">
                    <span>{item.customization.sizeLabel}</span>
                    {item.customization.isCombo && <span>• Meal Upgrade</span>}
                    {item.customization.selectedAddOns.map((a) => (
                      <span key={a.id}>• +{a.name.replace('Extra ', '')}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Loyalty Points Preview */}
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="font-bold">Flame Rewards Earned</span>
              </div>
              <span className="font-extrabold text-amber-800 dark:text-amber-300">
                +{Math.round(totals.total * 10)} pts
              </span>
            </div>

            {/* Breakdown */}
            <div className="space-y-2 border-t border-border-subtle pt-3 text-xs">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span>{formatAUD(totals.subtotal)}</span>
              </div>

              {totals.discountAmount > 0 && (
                <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>Promo Discount ({totals.appliedPromo?.code})</span>
                  <span>-{formatAUD(totals.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-text-secondary">
                <span>{fulfillmentMode === 'pickup' ? 'Store Pickup' : 'Melbourne Delivery Fee'}</span>
                <span>{totals.deliveryFee === 0 ? 'FREE' : formatAUD(totals.deliveryFee)}</span>
              </div>

              <div className="flex justify-between text-[11px] text-text-muted border-t border-border-subtle pt-2">
                <span>Includes 10% Australian GST</span>
                <span>{formatAUD(totals.gstIncluded)}</span>
              </div>

              <div className="flex justify-between items-baseline border-t border-border-subtle pt-2 text-base font-extrabold text-text-primary">
                <span>Total Due</span>
                <span className="font-display text-xl text-brand-primary">
                  {formatAUD(totals.total)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 3D Secure Simulated Bank Challenge Modal */}
      <Modal
        open={threeDsModalOpen}
        onOpenChange={setThreeDsModalOpen}
        title="3D Secure 2.0 Customer Verification"
        description={threeDsDetails?.bankName ?? 'Bank Authentication'}
        maxWidthClass="max-w-md"
        footer={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="md"
              className="flex-1"
              onClick={() => {
                setThreeDsModalOpen(false);
                setErrorMessage('3D Secure authentication cancelled by customer.');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              rightIcon={<Check className="h-4 w-4" />}
              onClick={handleVerify3DS}
            >
              Confirm OTP &amp; Authorize
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2 text-xs">
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-3.5 space-y-1.5 text-amber-900 dark:text-amber-200">
            <p className="font-bold">Simulated Multi-Factor Authentication</p>
            <p>
              Your bank has sent a secure 6-digit one-time passcode to mobile ending in ••••{' '}
              {threeDsDetails?.lastFourPhone}.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block font-bold uppercase tracking-wider text-text-secondary">
              Enter 6-Digit SMS Security Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              className="w-full rounded-xl border border-border-strong bg-bg-elevated p-3 text-center font-mono text-lg font-extrabold tracking-widest text-text-primary focus:border-brand-primary focus:outline-none"
            />
            <p className="text-[11px] text-text-muted text-center">
              Demo code pre-filled for convenience ({threeDsDetails?.challengeCode})
            </p>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-bg-elevated p-3 text-[11px] text-text-secondary">
            <span>Merchant: Southern Cross Burgers</span>
            <span className="font-bold text-text-primary">{formatAUD(totals.total)} AUD</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
