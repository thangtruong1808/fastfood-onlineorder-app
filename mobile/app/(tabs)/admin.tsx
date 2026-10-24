import { useRouter } from 'expo-router';
import {
  Activity,
  BarChart3,
  Clock,
  DollarSign,
  Flame,
  Receipt,
  Search,
  ShieldCheck,
  ShoppingBag,
  Tablet,
  TrendingUp,
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useToast } from '@/components/common/ToastProvider';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  CATEGORY_SHARE_DATA,
  FULFILLMENT_SPLIT_DATA,
  HOURLY_RUSH_DATA,
  SALES_30D,
  SALES_7D,
  SALES_90D,
  STORE_KPIS,
  TOP_SELLING_ITEMS,
} from '@/data/analyticsSeed';
import { MELBOURNE_STORES } from '@/data/storesSeed';
import { switchDemoRole } from '@/features/auth-mock/authSlice';
import {
  CategoryShareBreakdown,
  FulfillmentSplitBar,
  HourlyRushChart,
  RevenueTrendChart,
} from '@/features/dashboard/NativeAnalyticsCharts';
import { updateOrderStatus } from '@/features/orders/ordersSlice';
import { TaxReceiptModal } from '@/features/orders/TaxReceiptModal';
import { useTheme } from '@/hooks/useTheme';
import { formatAUD } from '@/lib/currency';
import { formatMelbTime } from '@/lib/date';
import type { OrderRecord, OrderStatus } from '@/types';

type DateRange = '7d' | '30d' | '90d';

export default function AdminAnalyticsTabScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { colors } = useTheme();
  const { showToast } = useToast();

  const { currentUser } = useAppSelector((state) => state.auth);
  const liveOrders = useAppSelector((state) => state.orders.orders);

  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrderReceipt, setSelectedOrderReceipt] = useState<OrderRecord | null>(null);

  const salesData = useMemo(() => {
    switch (dateRange) {
      case '30d':
        return SALES_30D;
      case '90d':
        return SALES_90D;
      case '7d':
      default:
        return SALES_7D;
    }
  }, [dateRange]);

  const totalRevenue = salesData.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalOrdersCount = salesData.reduce((acc, curr) => acc + curr.orders, 0);
  const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 29.8;

  const filteredOrders = useMemo(() => {
    return liveOrders.filter((order) => {
      if (selectedStoreId !== 'all' && order.storeId !== selectedStoreId) {
        return false;
      }
      if (orderStatusFilter !== 'all' && order.status !== orderStatusFilter) {
        return false;
      }
      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase().trim();
        return (
          order.orderNumber.toLowerCase().includes(q) ||
          order.customerName.toLowerCase().includes(q) ||
          order.storeSuburb.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [liveOrders, selectedStoreId, orderStatusFilter, orderSearchQuery]);

  const handleUpdateStatus = (orderId: string, nextStatus: OrderStatus) => {
    dispatch(updateOrderStatus({ orderId, status: nextStatus }));
    showToast({
      title: `Order Updated → ${nextStatus.toUpperCase()}`,
      description: 'Live kitchen board status synchronized.',
      tone: 'success',
    });
  };

  const handleSwitchToAdmin = () => {
    dispatch(switchDemoRole('admin'));
    showToast({
      title: 'Switched to Admin Persona (Sarah Chen)',
      description: 'Regional Operations Manager unlocked.',
      tone: 'success',
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 18 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Role Alert Banner if logged in as Customer or Guest */}
        {currentUser.role !== 'admin' ? (
          <Card
            style={{
              backgroundColor: colors.bgElevated,
              borderColor: colors.brandSecondary,
              borderWidth: 1,
              gap: 10,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={18} color={colors.brandSecondary} />
              <Text
                style={{
                  flex: 1,
                  color: colors.textPrimary,
                  fontSize: 12,
                  fontWeight: '700',
                }}
              >
                Viewing as {currentUser.name} ({currentUser.role.toUpperCase()}). Switch to
                Admin persona for full regional manager profile.
              </Text>
            </View>
            <Button variant="secondary" size="sm" onPress={handleSwitchToAdmin}>
              Switch to Admin Persona (Sarah Chen)
            </Button>
          </Card>
        ) : null}

        {/* Header & POS Terminal Launcher */}
        <View style={{ gap: 10 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Badge tone="brand">Melbourne Operations HQ</Badge>
            <Badge tone="success">● 8 Kitchens Live</Badge>
          </View>

          <Text style={{ color: colors.textPrimary, fontSize: 23, fontWeight: '900' }}>
            Store Performance & Kitchen Feed
          </Text>

          <Button
            variant="primary"
            size="md"
            fullWidth
            leftIcon={<Tablet size={16} color="#FFFFFF" />}
            onPress={() => router.push('/pos')}
          >
            Launch Counter / Drive-Thru POS Terminal
          </Button>
        </View>

        {/* Date Range Switcher (`7d` / `30d` / `90d`) */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: colors.bgElevated,
            borderRadius: 14,
            padding: 4,
            gap: 4,
          }}
        >
          {(
            [
              { id: '7d' as const, label: 'Last 7 Days' },
              { id: '30d' as const, label: '30 Days' },
              { id: '90d' as const, label: '90 Days' },
            ] as const
          ).map((range) => {
            const isActive = dateRange === range.id;
            return (
              <Pressable
                key={range.id}
                onPress={() => setDateRange(range.id)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: isActive ? colors.brandPrimary : 'transparent',
                }}
              >
                <Text
                  style={{
                    color: isActive ? '#FFFFFF' : colors.textSecondary,
                    fontSize: 12,
                    fontWeight: '800',
                  }}
                >
                  {range.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Store Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          <Pressable
            onPress={() => setSelectedStoreId('all')}
            style={{
              paddingHorizontal: 13,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor:
                selectedStoreId === 'all' ? colors.brandPrimary : colors.bgSurface,
              borderWidth: 1,
              borderColor:
                selectedStoreId === 'all' ? colors.brandPrimary : colors.borderSubtle,
            }}
          >
            <Text
              style={{
                color: selectedStoreId === 'all' ? '#FFFFFF' : colors.textPrimary,
                fontSize: 12,
                fontWeight: '800',
              }}
            >
              All 8 Melbourne Kitchens
            </Text>
          </Pressable>

          {MELBOURNE_STORES.map((store) => {
            const isSelected = selectedStoreId === store.id;
            return (
              <Pressable
                key={store.id}
                onPress={() => setSelectedStoreId(store.id)}
                style={{
                  paddingHorizontal: 13,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: isSelected ? colors.brandPrimary : colors.bgSurface,
                  borderWidth: 1,
                  borderColor: isSelected ? colors.brandPrimary : colors.borderSubtle,
                }}
              >
                <Text
                  style={{
                    color: isSelected ? '#FFFFFF' : colors.textPrimary,
                    fontSize: 12,
                    fontWeight: '800',
                  }}
                >
                  {store.suburb}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* 4 KPI Summary Cards (2x2 Grid) */}
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Card style={{ flex: 1, gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700' }}>
                  Gross Revenue ({dateRange.toUpperCase()})
                </Text>
                <DollarSign size={15} color={colors.brandPrimary} />
              </View>
              <Text style={{ color: colors.textPrimary, fontSize: 19, fontWeight: '900' }}>
                {formatAUD(totalRevenue)}
              </Text>
              <Badge tone="success">+14.2% vs prior</Badge>
            </Card>

            <Card style={{ flex: 1, gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700' }}>
                  Orders Fulfilled
                </Text>
                <ShoppingBag size={15} color={colors.brandSecondary} />
              </View>
              <Text style={{ color: colors.textPrimary, fontSize: 19, fontWeight: '900' }}>
                {totalOrdersCount.toLocaleString()}
              </Text>
              <Badge tone="success">+11.8% volume</Badge>
            </Card>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Card style={{ flex: 1, gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700' }}>
                  Average Order (AOV)
                </Text>
                <TrendingUp size={15} color={colors.statusSuccess} />
              </View>
              <Text style={{ color: colors.textPrimary, fontSize: 19, fontWeight: '900' }}>
                {formatAUD(averageOrderValue)}
              </Text>
              <Badge tone="amber">+2.1% upsell</Badge>
            </Card>

            <Card style={{ flex: 1, gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700' }}>
                  Avg Grill Prep Time
                </Text>
                <Clock size={15} color={colors.statusInfo} />
              </View>
              <Text style={{ color: colors.textPrimary, fontSize: 19, fontWeight: '900' }}>
                7.2 mins
              </Text>
              <Badge tone="info">98.4% On-Time</Badge>
            </Card>
          </View>
        </View>

        {/* Chart 1: Revenue Trend (SVG Area Chart) */}
        <Card style={{ gap: 12 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View>
              <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '900' }}>
                Melbourne Revenue Trajectory
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                AUD gross sales across active period ({dateRange.toUpperCase()})
              </Text>
            </View>
            <Badge tone="brand">AUD ($)</Badge>
          </View>

          <RevenueTrendChart data={salesData} />
        </Card>

        {/* Chart 2: Hourly Rush Distribution */}
        <Card style={{ gap: 12 }}>
          <View>
            <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '900' }}>
              Hourly Kitchen Rush (Pickup vs Delivery)
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
              Peak Melbourne rushes at 12 PM–1 PM Lunch & 6 PM–8 PM Dinner
            </Text>
          </View>

          <HourlyRushChart data={HOURLY_RUSH_DATA} />
        </Card>

        {/* Chart 3: Category Share & Fulfillment Split */}
        <Card style={{ gap: 14 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '900' }}>
            Category Revenue Share
          </Text>
          <CategoryShareBreakdown data={CATEGORY_SHARE_DATA} />
        </Card>

        <Card style={{ gap: 14 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '900' }}>
            Fulfillment Channel Split
          </Text>
          <FulfillmentSplitBar data={FULFILLMENT_SPLIT_DATA} />
        </Card>

        {/* Top Selling Melbourne Menu Items */}
        <Card style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Flame size={17} color={colors.brandPrimary} />
            <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '900' }}>
              Top-Selling Melbourne Dishes
            </Text>
          </View>

          <View style={{ gap: 10 }}>
            {TOP_SELLING_ITEMS.map((item, idx) => (
              <View
                key={item.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 8,
                  borderBottomWidth: idx === TOP_SELLING_ITEMS.length - 1 ? 0 : 1,
                  borderBottomColor: colors.borderSubtle,
                  gap: 10,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                  <View
                    style={{
                      height: 28,
                      width: 28,
                      borderRadius: 8,
                      backgroundColor: colors.bgElevated,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: colors.brandPrimary,
                        fontSize: 12,
                        fontWeight: '900',
                      }}
                    >
                      #{idx + 1}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        color: colors.textPrimary,
                        fontSize: 13,
                        fontWeight: '800',
                      }}
                    >
                      {item.name}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                      {item.category} • {item.unitsSold.toLocaleString()} sold
                    </Text>
                  </View>
                </View>

                <View style={{ alignItems: 'flex-end', gap: 2 }}>
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontSize: 13,
                      fontWeight: '900',
                    }}
                  >
                    {formatAUD(item.revenue)}
                  </Text>
                  <Badge tone="success">{item.growth}</Badge>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Regional Store KPI Leaderboard */}
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <BarChart3 size={17} color={colors.brandPrimary} />
            <Text style={{ color: colors.textPrimary, fontSize: 17, fontWeight: '900' }}>
              Regional Kitchen KPIs
            </Text>
          </View>

          {STORE_KPIS.map((store) => (
            <Card key={store.storeId} style={{ gap: 8 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '800' }}>
                    {store.name}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                    {store.suburb} • Avg Prep {store.avgPrepTimeMins}m • ★ {store.rating}
                  </Text>
                </View>
                <Badge tone={store.status === 'optimal' ? 'success' : 'amber'}>
                  {store.status.toUpperCase()}
                </Badge>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingTop: 6,
                  borderTopWidth: 1,
                  borderTopColor: colors.borderSubtle,
                }}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  {store.orders.toLocaleString()} orders fulfilled
                </Text>
                <Text style={{ color: colors.brandPrimary, fontSize: 13, fontWeight: '900' }}>
                  {formatAUD(store.revenue)}
                </Text>
              </View>
            </Card>
          ))}
        </View>

        {/* Live Kitchen Order Feed & Status Controller */}
        <View style={{ gap: 12 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Activity size={17} color={colors.brandPrimary} />
              <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '900' }}>
                Live Kitchen Order Feed ({filteredOrders.length})
              </Text>
            </View>
            <Badge tone="success">Real-Time</Badge>
          </View>

          <Input
            placeholder="Filter orders by #SCB, customer name, or suburb..."
            value={orderSearchQuery}
            onChangeText={setOrderSearchQuery}
            leftIcon={<Search size={15} color={colors.textMuted} />}
          />

          {/* Status Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 6 }}
          >
            {[
              { id: 'all', label: 'All Stages' },
              { id: 'received', label: 'Received' },
              { id: 'preparing', label: 'Grilling' },
              { id: 'ready_or_out', label: 'Ready / Out' },
              { id: 'completed', label: 'Completed' },
            ].map((st) => {
              const isSelected = orderStatusFilter === st.id;
              return (
                <Pressable
                  key={st.id}
                  onPress={() => setOrderStatusFilter(st.id)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 999,
                    backgroundColor: isSelected ? colors.brandPrimary : colors.bgSurface,
                    borderWidth: 1,
                    borderColor: isSelected ? colors.brandPrimary : colors.borderSubtle,
                  }}
                >
                  <Text
                    style={{
                      color: isSelected ? '#FFFFFF' : colors.textSecondary,
                      fontSize: 11,
                      fontWeight: '800',
                    }}
                  >
                    {st.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {filteredOrders.map((order) => (
            <Card key={order.id} style={{ gap: 10 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Badge tone="brand">#{order.orderNumber}</Badge>
                  <Badge tone="amber">{order.fulfillmentMode.toUpperCase()}</Badge>
                </View>
                <Text style={{ color: colors.brandPrimary, fontSize: 15, fontWeight: '900' }}>
                  {formatAUD(order.total)}
                </Text>
              </View>

              <View>
                <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '800' }}>
                  {order.customerName} • {order.storeSuburb} Kitchen
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                  Placed {formatMelbTime(order.createdAt)} • {order.items.length} items •{' '}
                  {order.scheduledSlot}
                </Text>
              </View>

              {/* 1-Tap Kitchen Stage Advancement Controls */}
              <View style={{ gap: 6 }}>
                <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '800' }}>
                  ADVANCE KITCHEN STAGE:
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {(
                    [
                      { id: 'received' as const, label: 'Received' },
                      { id: 'preparing' as const, label: 'Grilling' },
                      { id: 'ready_or_out' as const, label: 'Ready/Out' },
                      { id: 'completed' as const, label: 'Completed' },
                    ] as const
                  ).map((stage) => {
                    const active = order.status === stage.id;
                    return (
                      <Pressable
                        key={stage.id}
                        onPress={() => handleUpdateStatus(order.id, stage.id)}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 9,
                          backgroundColor: active
                            ? colors.brandPrimary
                            : colors.bgElevated,
                          borderWidth: 1,
                          borderColor: active
                            ? colors.brandPrimary
                            : colors.borderStrong,
                        }}
                      >
                        <Text
                          style={{
                            color: active ? '#FFFFFF' : colors.textPrimary,
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
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingTop: 6,
                  borderTopWidth: 1,
                  borderTopColor: colors.borderSubtle,
                }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Receipt size={13} color={colors.textSecondary} />}
                  onPress={() => setSelectedOrderReceipt(order)}
                >
                  View Tax Invoice
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => router.push(`/tracking/${order.id}`)}
                >
                  Open Live Tracker
                </Button>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      <TaxReceiptModal
        order={selectedOrderReceipt}
        open={Boolean(selectedOrderReceipt)}
        onOpenChange={(open) => {
          if (!open) setSelectedOrderReceipt(null);
        }}
      />
    </View>
  );
}
