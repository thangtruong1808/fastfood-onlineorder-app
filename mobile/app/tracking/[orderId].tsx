import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  CheckCircle2,
  Clock,
  FastForward,
  Flame,
  MapPin,
  PackageCheck,
  Receipt,
  Sparkles,
  Store as StoreIcon,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useToast } from '@/components/common/ToastProvider';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { updateOrderStatus } from '@/features/orders/ordersSlice';
import { TaxReceiptModal } from '@/features/orders/TaxReceiptModal';
import { useTheme } from '@/hooks/useTheme';
import { formatAUD } from '@/lib/currency';
import { formatMelbTime } from '@/lib/date';
import type { OrderRecord, OrderStatus } from '@/types';

const TIMELINE_STAGES: Array<{
  status: OrderStatus;
  label: string;
  sublabel: string;
  Icon: typeof CheckCircle2;
}> = [
  {
    status: 'received',
    label: 'Order Confirmed',
    sublabel: 'Sent to Melbourne Kitchen Gateway',
    Icon: CheckCircle2,
  },
  {
    status: 'preparing',
    label: 'Flame Grilling',
    sublabel: 'Gippsland beef seared over ironbark flame',
    Icon: Flame,
  },
  {
    status: 'ready_or_out',
    label: 'Ready / En Route',
    sublabel: 'Packed in thermal bag • Ready for collection/delivery',
    Icon: Bike,
  },
  {
    status: 'completed',
    label: 'Order Fulfilled',
    sublabel: 'Enjoy your Southern Cross meal hot & fresh!',
    Icon: PackageCheck,
  },
];

const STAGE_ORDER: OrderStatus[] = [
  'received',
  'preparing',
  'ready_or_out',
  'completed',
];

export default function LiveOrderTrackingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { showToast } = useToast();

  const orders = useAppSelector((state) => state.orders.orders);
  const activeOrder: OrderRecord | undefined =
    orders.find((o) => o.id === orderId || o.orderNumber === orderId) ?? orders[0];

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    if (!activeOrder || activeOrder.status === 'completed') {
      return;
    }

    const interval = setInterval(() => {
      setElapsedMinutes((prev) => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, [activeOrder]);

  if (!activeOrder) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bgPrimary,
          paddingTop: insets.top + 16,
          paddingHorizontal: 16,
        }}
      >
        <EmptyState
          icon={<Clock size={28} color={colors.brandPrimary} />}
          title="No Active Order Found"
          description="Place an order from our Melbourne menu to test live kitchen tracking."
          actionLabel="Browse Melbourne Menu"
          onAction={() => router.replace('/(tabs)/menu')}
        />
      </View>
    );
  }

  const currentStageIndex = STAGE_ORDER.indexOf(activeOrder.status);
  const etaRemainingMins =
    activeOrder.status === 'completed'
      ? 0
      : activeOrder.status === 'ready_or_out'
        ? Math.max(2, 6 - elapsedMinutes)
        : Math.max(4, 15 - elapsedMinutes);

  const handleAdvanceStatus = (nextStatus: OrderStatus) => {
    dispatch(updateOrderStatus({ orderId: activeOrder.id, status: nextStatus }));
    showToast({
      title: `Order Stage: ${nextStatus.toUpperCase()}`,
      description: `Updated Order #${activeOrder.orderNumber} live tracker.`,
      tone: 'info',
    });
  };

  return (
    <View
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
          onPress={() => router.replace('/(tabs)/orders')}
        >
          Orders
        </Button>

        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '900' }}>
            Order #{activeOrder.orderNumber}
          </Text>
          <Text style={{ color: colors.statusSuccess, fontSize: 10, fontWeight: '800' }}>
            ● LIVE MELBOURNE TRACKER
          </Text>
        </View>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<Receipt size={14} color={colors.brandPrimary} />}
          onPress={() => setReceiptModalOpen(true)}
        >
          Invoice
        </Button>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 44, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Reviewer Fast-Forward Stage Controls */}
        <Card
          style={{
            backgroundColor: colors.bgElevated,
            borderColor: colors.brandPrimary,
            borderWidth: 1,
            gap: 10,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <FastForward size={15} color={colors.brandPrimary} />
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 11,
                fontWeight: '800',
                textTransform: 'uppercase',
              }}
            >
              Demo Presentation Controls (Fast-Forward Stages)
            </Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {[
              { id: 'received' as const, label: '1. Received' },
              { id: 'preparing' as const, label: '2. Grilling' },
              { id: 'ready_or_out' as const, label: '3. Ready/Out' },
              { id: 'completed' as const, label: '4. Complete' },
            ].map((stage) => {
              const isCurrent = activeOrder.status === stage.id;
              return (
                <Pressable
                  key={stage.id}
                  onPress={() => handleAdvanceStatus(stage.id)}
                  style={{
                    paddingHorizontal: 11,
                    paddingVertical: 7,
                    borderRadius: 10,
                    backgroundColor: isCurrent ? colors.brandPrimary : colors.bgSurface,
                    borderWidth: 1,
                    borderColor: isCurrent ? colors.brandPrimary : colors.borderStrong,
                  }}
                >
                  <Text
                    style={{
                      color: isCurrent ? '#FFFFFF' : colors.textPrimary,
                      fontSize: 11,
                      fontWeight: '800',
                    }}
                  >
                    {stage.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* Live ETA & Status Hero Banner */}
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
            <Badge tone="success">Placed at {formatMelbTime(activeOrder.createdAt)}</Badge>
            <Badge tone="amber">{activeOrder.fulfillmentMode.toUpperCase()}</Badge>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View
              style={{
                height: 58,
                width: 58,
                borderRadius: 18,
                backgroundColor: colors.brandPrimary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {activeOrder.status === 'completed' ? (
                <CheckCircle2 size={28} color="#FFFFFF" />
              ) : activeOrder.status === 'ready_or_out' ? (
                <Bike size={28} color="#FFFFFF" />
              ) : (
                <Flame size={28} color="#FFFFFF" />
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: '#FCD34D',
                  fontSize: 11,
                  fontWeight: '800',
                  textTransform: 'uppercase',
                }}
              >
                {activeOrder.status === 'completed'
                  ? 'Order Fulfilled'
                  : activeOrder.fulfillmentMode === 'pickup'
                    ? 'Estimated Counter Pickup'
                    : 'Estimated Courier Arrival'}
              </Text>
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 24,
                  fontWeight: '900',
                  marginTop: 2,
                }}
              >
                {activeOrder.status === 'completed'
                  ? 'Completed — Enjoy!'
                  : `~${etaRemainingMins} mins remaining`}
              </Text>
              <Text style={{ color: 'rgba(254, 243, 199, 0.8)', fontSize: 12 }}>
                {activeOrder.storeName} ({activeOrder.scheduledSlot})
              </Text>
            </View>
          </View>
        </View>

        {/* 4-Stage Progress Timeline */}
        <Card style={{ gap: 14 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '800' }}>
            Live Kitchen Progress
          </Text>

          <View style={{ gap: 12 }}>
            {TIMELINE_STAGES.map((stage, index) => {
              const Icon = stage.Icon;
              const isDone = index <= currentStageIndex;
              const isCurrent = index === currentStageIndex;

              return (
                <View
                  key={stage.status}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    borderRadius: 16,
                    borderWidth: isCurrent ? 1.5 : 1,
                    borderColor: isCurrent
                      ? colors.brandPrimary
                      : isDone
                        ? colors.statusSuccess
                        : colors.borderSubtle,
                    backgroundColor: isCurrent ? colors.bgElevated : colors.bgSurface,
                  }}
                >
                  <View
                    style={{
                      height: 40,
                      width: 40,
                      borderRadius: 12,
                      backgroundColor: isCurrent
                        ? colors.brandPrimary
                        : isDone
                          ? colors.statusSuccess
                          : colors.bgElevated,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon
                      size={20}
                      color={isDone ? '#FFFFFF' : colors.textMuted}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text
                        style={{
                          color: isDone ? colors.textPrimary : colors.textMuted,
                          fontSize: 14,
                          fontWeight: '800',
                        }}
                      >
                        {stage.label}
                      </Text>
                      {isCurrent ? (
                        <Badge tone="brand">In Progress</Badge>
                      ) : isDone ? (
                        <Badge tone="success">Done</Badge>
                      ) : null}
                    </View>
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      {stage.sublabel}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Kitchen & Fulfillment Card */}
        <Card style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {activeOrder.fulfillmentMode === 'pickup' ? (
              <StoreIcon size={17} color={colors.brandPrimary} />
            ) : (
              <MapPin size={17} color={colors.brandPrimary} />
            )}
            <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '800' }}>
              {activeOrder.fulfillmentMode === 'pickup'
                ? 'Counter Pickup Location'
                : 'Delivery Drop-off Destination'}
            </Text>
          </View>

          <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '700' }}>
            {activeOrder.fulfillmentMode === 'pickup'
              ? activeOrder.storeName
              : activeOrder.deliveryAddress || '42 Napier Street, Fitzroy VIC 3065'}
          </Text>

          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
            Customer: {activeOrder.customerName} ({activeOrder.customerPhone})
          </Text>
        </Card>

        {/* Order Items & AUD Summary */}
        <Card style={{ gap: 12 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '800' }}>
              Order Summary ({activeOrder.items.length} items)
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Sparkles size={13} color={colors.brandSecondary} />
              <Text
                style={{
                  color: colors.brandSecondary,
                  fontSize: 12,
                  fontWeight: '800',
                }}
              >
                +{activeOrder.loyaltyPointsEarned} pts
              </Text>
            </View>
          </View>

          {activeOrder.items.map((item) => (
            <View
              key={item.cartItemId}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 6,
                borderBottomWidth: 1,
                borderBottomColor: colors.borderSubtle,
              }}
            >
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 13,
                    fontWeight: '700',
                  }}
                >
                  {item.quantity}x {item.name}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                  {item.customization.sizeLabel}
                  {item.customization.isCombo ? ' • Combo Meal' : ''}
                </Text>
              </View>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 13,
                  fontWeight: '800',
                }}
              >
                {formatAUD(item.unitPrice * item.quantity)}
              </Text>
            </View>
          ))}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              paddingTop: 4,
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              Total Paid ({activeOrder.paymentMethodLabel}) • incl. {formatAUD(activeOrder.gstIncluded)} GST
            </Text>
            <Text
              style={{
                color: colors.brandPrimary,
                fontSize: 17,
                fontWeight: '900',
              }}
            >
              {formatAUD(activeOrder.total)}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, paddingTop: 6 }}>
            <View style={{ flex: 1 }}>
              <Button
                variant="outline"
                fullWidth
                leftIcon={<Receipt size={15} color={colors.textPrimary} />}
                onPress={() => setReceiptModalOpen(true)}
              >
                Tax Invoice
              </Button>
            </View>
            <View style={{ flex: 1 }}>
              <Button
                variant="primary"
                fullWidth
                rightIcon={<ArrowRight size={15} color="#FFFFFF" />}
                onPress={() => router.replace('/(tabs)/menu')}
              >
                Order Again
              </Button>
            </View>
          </View>
        </Card>
      </ScrollView>

      <TaxReceiptModal
        order={activeOrder}
        open={receiptModalOpen}
        onOpenChange={setReceiptModalOpen}
      />
    </View>
  );
}

