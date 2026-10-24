import {
  ArrowRight,
  Bike,
  CheckCircle2,
  Clock,
  FastForward,
  Flame,
  MapPin,
  PackageCheck,
  Phone,
  Printer,
  Receipt,
  Sparkles,
  Store as StoreIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { updateOrderStatus } from '@/features/orders/ordersSlice';
import { cn } from '@/lib/cn';
import { formatAUD } from '@/lib/currency';
import { formatMelbDate, formatMelbTime } from '@/lib/date';
import type { OrderRecord, OrderStatus } from '@/types';

const TIMELINE_STAGES: Array<{
  status: OrderStatus;
  label: string;
  sublabel: string;
  icon: typeof CheckCircle2;
}> = [
  {
    status: 'received',
    label: 'Order Confirmed',
    sublabel: 'Sent to Kitchen Gateway',
    icon: CheckCircle2,
  },
  {
    status: 'preparing',
    label: 'Flame Grilling',
    sublabel: 'Gippsland beef on open ironbark flame',
    icon: Flame,
  },
  {
    status: 'ready_or_out',
    label: 'Ready / En Route',
    sublabel: 'Packed in thermal bag • On the move',
    icon: Bike,
  },
  {
    status: 'completed',
    label: 'Order Fulfilled',
    sublabel: 'Delivered / Collected hot & fresh',
    icon: PackageCheck,
  },
];

export default function TrackingShellPage() {
  const { orderId } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const orders = useAppSelector((state) => state.orders.orders);
  const activeOrder: OrderRecord =
    orders.find((o) => o.id === orderId || o.orderNumber === orderId) ??
    orders[0];

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  // Countdown timer simulation
  useEffect(() => {
    if (activeOrder.status === 'completed') {
      return;
    }

    const interval = setInterval(() => {
      setElapsedMinutes((prev) => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, [activeOrder.status]);

  const etaRemainingMins =
    activeOrder.status === 'completed' ? 0 : Math.max(1, 14 - elapsedMinutes);

  if (!activeOrder) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-primary/10 text-brand-primary">
          <Clock className="h-8 w-8" />
        </div>
        <h1 className="font-display text-2xl font-bold">No Active Order Found</h1>
        <p className="text-sm text-text-secondary">
          Place an order from our Melbourne menu to test live kitchen tracking.
        </p>
        <Button variant="primary" size="lg" onClick={() => navigate('/menu')}>
          Browse Menu
        </Button>
      </div>
    );
  }

  const stageOrder: OrderStatus[] = ['received', 'preparing', 'ready_or_out', 'completed'];
  const currentStageIndex = stageOrder.indexOf(activeOrder.status);

  const handleAdvanceStatus = (nextStatus: OrderStatus) => {
    dispatch(updateOrderStatus({ orderId: activeOrder.id, status: nextStatus }));
    toast.success(`Advanced status to: ${nextStatus.toUpperCase()}`);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      {/* Top Banner & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border-subtle pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="success" className="animate-pulse">
              ● Live Kitchen Feed
            </Badge>
            <Badge tone="brand">Order #{activeOrder.orderNumber}</Badge>
            <span className="text-xs text-text-muted">
              Placed at {formatMelbTime(activeOrder.createdAt)}
            </span>
          </div>
          <h1 className="mt-1.5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {activeOrder.status === 'completed'
              ? 'Enjoy Your Meal!'
              : activeOrder.status === 'ready_or_out'
                ? activeOrder.fulfillmentMode === 'pickup'
                  ? 'Ready for Counter Pickup!'
                  : 'Courier En Route to You!'
                : 'Preparing Your Flame-Grilled Feast'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Receipt className="h-4 w-4" />}
            onClick={() => setReceiptModalOpen(true)}
          >
            View Tax Receipt
          </Button>

          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight className="h-4 w-4" />}
            onClick={() => navigate('/menu')}
          >
            Order Again
          </Button>
        </div>
      </div>

      {/* Floating Demo Fast-Forward Toolbar (Reviewer Showcase Feature) */}
      <div className="rounded-2xl border border-brand-primary/25 bg-gradient-to-r from-brand-primary/10 via-amber-500/10 to-transparent p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <FastForward className="h-4 w-4 text-brand-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Live Tracker Presentation Controls (Fast-Forward Stages)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleAdvanceStatus('received')}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer',
                activeOrder.status === 'received'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'bg-bg-surface text-text-secondary hover:text-text-primary',
              )}
            >
              1. Received
            </button>
            <button
              type="button"
              onClick={() => handleAdvanceStatus('preparing')}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer',
                activeOrder.status === 'preparing'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'bg-bg-surface text-text-secondary hover:text-text-primary',
              )}
            >
              2. Grilling
            </button>
            <button
              type="button"
              onClick={() => handleAdvanceStatus('ready_or_out')}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer',
                activeOrder.status === 'ready_or_out'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'bg-bg-surface text-text-secondary hover:text-text-primary',
              )}
            >
              3. Ready/Out
            </button>
            <button
              type="button"
              onClick={() => handleAdvanceStatus('completed')}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer',
                activeOrder.status === 'completed'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'bg-bg-surface text-text-secondary hover:text-text-primary',
              )}
            >
              4. Complete
            </button>
          </div>
        </div>
      </div>

      {/* Main Tracking Card: Live ETA & 4-Stage Timeline */}
      <Card className="p-6 sm:p-8 space-y-8">
        {/* ETA Hero Row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border-subtle pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-md">
              {activeOrder.status === 'completed' ? (
                <CheckCircle2 className="h-8 w-8" />
              ) : activeOrder.status === 'ready_or_out' ? (
                <Bike className="h-8 w-8 animate-bounce" />
              ) : (
                <Clock className="h-8 w-8 animate-spin-slow" />
              )}
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                {activeOrder.status === 'completed'
                  ? 'Completed'
                  : activeOrder.fulfillmentMode === 'pickup'
                    ? 'Estimated Counter Pickup'
                    : 'Estimated Courier Arrival'}
              </p>
              <h2 className="font-display text-2xl font-extrabold sm:text-3xl text-text-primary">
                {activeOrder.status === 'completed'
                  ? 'Delivered & Confirmed'
                  : `~${etaRemainingMins} minutes remaining`}
              </h2>
              <p className="text-xs text-text-muted">
                Kitchen schedule: {activeOrder.scheduledSlot}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="block text-xs font-bold uppercase tracking-wider text-text-muted">
              Melbourne Kitchen
            </span>
            <span className="font-display text-base font-bold text-text-primary">
              {activeOrder.storeName}
            </span>
            <span className="block text-xs text-text-secondary">
              {activeOrder.storeSuburb} • {activeOrder.fulfillmentMode.toUpperCase()}
            </span>
          </div>
        </div>

        {/* 4-Stage Visual Progress Timeline */}
        <div className="space-y-4">
          {/* Progress Track Bar */}
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-border-subtle">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-brand-primary transition-all duration-700 ease-out"
              style={{
                width: `${((currentStageIndex + 1) / stageOrder.length) * 100}%`,
              }}
            />
          </div>

          {/* Timeline Stage Indicators */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {TIMELINE_STAGES.map((stage, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const Icon = stage.icon;

              return (
                <div
                  key={stage.status}
                  className={cn(
                    'flex flex-col rounded-2xl border p-4 transition-all duration-300',
                    isCurrent
                      ? 'border-brand-primary bg-brand-primary/8 ring-2 ring-brand-primary shadow-xs'
                      : isPast
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : 'border-border-subtle bg-bg-surface opacity-60',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold',
                        isCurrent
                          ? 'bg-brand-primary text-white shadow-xs'
                          : isPast
                            ? 'bg-emerald-500 text-white'
                            : 'bg-bg-elevated text-text-muted',
                      )}
                    >
                      {isPast ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
                      Stage {idx + 1}
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-sm font-bold text-text-primary">
                    {stage.label}
                  </h3>
                  <p className="mt-0.5 text-xs text-text-secondary leading-snug">
                    {stage.sublabel}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Two Column Grid: Kitchen & Driver Status + Itemized Order Summary */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left: Kitchen & Fulfillment Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
              <StoreIcon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-text-primary">
                Kitchen Fulfillment Details
              </h3>
              <p className="text-xs text-text-secondary">
                {activeOrder.storeName} ({activeOrder.storeSuburb})
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-border-subtle bg-bg-elevated/50 p-4 text-xs">
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 shrink-0 text-brand-primary mt-0.5" />
              <div>
                <p className="font-bold text-text-primary">Destination / Location</p>
                <p className="text-text-secondary">
                  {activeOrder.fulfillmentMode === 'delivery'
                    ? activeOrder.deliveryAddress
                    : `Express Counter Bay • ${activeOrder.storeName}`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <p className="font-bold text-text-primary">Fulfillment Schedule</p>
                <p className="text-text-secondary">{activeOrder.scheduledSlot}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
              <div>
                <p className="font-bold text-text-primary">Kitchen Hotline</p>
                <p className="text-text-secondary">(03) 9650 4110 • Mention #{activeOrder.orderNumber}</p>
              </div>
            </div>
          </div>

          {/* Courier Card (if delivery) */}
          {activeOrder.fulfillmentMode === 'delivery' && (
            <div className="rounded-2xl border border-border-subtle bg-bg-surface p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  LM
                </div>
                <div>
                  <p className="text-xs font-bold text-text-primary">Liam M. (E-Bike Courier)</p>
                  <p className="text-[11px] text-text-muted">4.9 ★ Rating • Melbourne Inner North</p>
                </div>
              </div>
              <Badge tone="success">Eco Delivery</Badge>
            </div>
          )}
        </Card>

        {/* Right: Items in this order */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <h3 className="font-display text-base font-bold text-text-primary">
              Order Bag ({activeOrder.items.length} Line Items)
            </h3>
            <span className="font-display text-base font-extrabold text-brand-primary">
              {formatAUD(activeOrder.total)}
            </span>
          </div>

          <div className="divide-y divide-border-subtle max-h-64 overflow-y-auto pr-1 space-y-3">
            {activeOrder.items.map((item) => (
              <div key={item.cartItemId} className="pt-3 first:pt-0 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-text-primary">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span>{formatAUD(item.unitPrice * item.quantity)}</span>
                </div>
                <div className="flex flex-wrap gap-1 text-[11px] text-text-muted">
                  <span>{item.customization.sizeLabel}</span>
                  {item.customization.isCombo && <span>• Meal Box</span>}
                  {item.customization.selectedAddOns.map((a) => (
                    <span key={a.id}>• +{a.name.replace('Extra ', '')}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Loyalty earned banner */}
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="font-bold">Southern Flame Rewards</span>
            </div>
            <span className="font-extrabold text-amber-800 dark:text-amber-300">
              +{activeOrder.loyaltyPointsEarned} pts awarded
            </span>
          </div>
        </Card>
      </div>

      {/* Tax Invoice & Receipt Modal */}
      <Modal
        open={receiptModalOpen}
        onOpenChange={setReceiptModalOpen}
        title={`Tax Invoice • #${activeOrder.orderNumber}`}
        description="Official simulated tax invoice compliant with Australian GST requirements"
        maxWidthClass="max-w-lg"
        footer={
          <div className="flex justify-between gap-3 w-full">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="h-4 w-4" />}
              onClick={handlePrintReceipt}
            >
              Print Receipt
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setReceiptModalOpen(false)}
            >
              Done
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2 text-xs">
          {/* Header Merchant Info */}
          <div className="text-center border-b border-border-subtle pb-4 space-y-1">
            <h3 className="font-display text-lg font-extrabold text-text-primary">
              Southern Cross Burgers Pty Ltd
            </h3>
            <p className="text-text-muted">ABN 48 612 904 331</p>
            <p className="text-text-secondary">
              {activeOrder.storeName} • {activeOrder.storeSuburb}, VIC
            </p>
            <p className="text-text-muted">
              {formatMelbDate(activeOrder.createdAt)} at {formatMelbTime(activeOrder.createdAt)}
            </p>
          </div>

          {/* Customer & Fulfillment */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-bg-elevated p-3 text-[11px]">
            <div>
              <span className="text-text-muted block">Customer:</span>
              <span className="font-bold text-text-primary">{activeOrder.customerName}</span>
              <span className="block text-text-muted">{activeOrder.customerEmail}</span>
            </div>
            <div className="text-right">
              <span className="text-text-muted block">Payment Method:</span>
              <span className="font-bold text-text-primary">{activeOrder.paymentMethodLabel}</span>
              <span className="block text-emerald-600 dark:text-emerald-400 font-semibold">
                Status: PAID
              </span>
            </div>
          </div>

          {/* Line items table */}
          <div className="space-y-2 border-b border-border-subtle pb-3">
            <div className="flex justify-between font-bold text-text-muted text-[11px]">
              <span>Description</span>
              <span>Total (AUD)</span>
            </div>
            {activeOrder.items.map((item) => (
              <div key={item.cartItemId} className="flex justify-between text-text-primary">
                <div>
                  <span>
                    {item.quantity}x {item.name} ({item.customization.sizeLabel})
                  </span>
                  {item.customization.isCombo && (
                    <span className="block text-[10px] text-text-muted">
                      + Meal Upgrade ({item.customization.comboDrink}, {item.customization.comboSide})
                    </span>
                  )}
                </div>
                <span className="font-semibold">{formatAUD(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Tax Breakdown */}
          <div className="space-y-1.5 text-xs text-text-secondary">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatAUD(activeOrder.subtotal)}</span>
            </div>
            {activeOrder.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Promo Discount ({activeOrder.promoCode})</span>
                <span>-{formatAUD(activeOrder.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>
                {activeOrder.deliveryFee === 0 ? 'FREE' : formatAUD(activeOrder.deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between border-t border-border-subtle pt-2 text-[11px] font-bold text-text-muted">
              <span>Includes 10% Australian GST (1/11th)</span>
              <span>{formatAUD(activeOrder.gstIncluded)}</span>
            </div>
            <div className="flex justify-between border-t border-border-subtle pt-2 text-base font-extrabold text-text-primary">
              <span>Total Paid (AUD)</span>
              <span className="font-display text-brand-primary">
                {formatAUD(activeOrder.total)}
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
