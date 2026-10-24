import {
  Activity,
  ChevronDown,
  DollarSign,
  Search,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import {
  CATEGORY_SHARE_DATA,
  FULFILLMENT_SPLIT_DATA,
  HOURLY_RUSH_DATA,
  SALES_30D,
  SALES_7D,
  SALES_90D,
  TOP_SELLING_ITEMS,
} from '@/data/analyticsSeed';
import { MELBOURNE_STORES } from '@/data/storesSeed';
import { switchDemoRole } from '@/features/auth-mock/authSlice';
import { updateOrderStatus } from '@/features/orders/ordersSlice';
import { cn } from '@/lib/cn';
import { formatAUD } from '@/lib/currency';
import { formatMelbDate, formatMelbTime } from '@/lib/date';
import type { OrderRecord, OrderStatus } from '@/types';

type DateRange = '7d' | '30d' | '90d';

export default function AdminDashboardShellPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { currentUser } = useAppSelector((state) => state.auth);
  const liveOrders = useAppSelector((state) => state.orders.orders);

  // Filters state
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrderReceipt, setSelectedOrderReceipt] = useState<OrderRecord | null>(null);

  // Pick dataset based on selected date range
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

  // Aggregate KPI metrics
  const totalRevenue = salesData.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalOrdersCount = salesData.reduce((acc, curr) => acc + curr.orders, 0);
  const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 29.8;

  // Filtered live orders list
  const filteredOrders = useMemo(() => {
    return liveOrders.filter((order) => {
      // 1. Store filter
      if (selectedStoreId !== 'all' && order.storeId !== selectedStoreId) {
        return false;
      }
      // 2. Status filter
      if (orderStatusFilter !== 'all' && order.status !== orderStatusFilter) {
        return false;
      }
      // 3. Search query
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
    toast.success(`Updated Order status to: ${nextStatus.toUpperCase()}`);
  };

  const handleSwitchToAdmin = () => {
    dispatch(switchDemoRole('admin'));
    toast.success('Switched to Store Manager / Regional Admin Persona (Sarah Chen)');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Role Alert Banner if logged in as Customer */}
      {currentUser.role !== 'admin' && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-amber-500 shrink-0" />
            <span>
              <strong>Demo Notice:</strong> You are currently viewing as{' '}
              <strong>{currentUser.name} ({currentUser.role.toUpperCase()})</strong>. You have full view of
              regional analytics, but switching to Admin unlocks operations persona settings.
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-amber-500/40 bg-white/50 dark:bg-black/40 text-amber-900 dark:text-amber-200 hover:bg-amber-500/20"
            onClick={handleSwitchToAdmin}
          >
            Switch to Admin Persona
          </Button>
        </div>
      )}

      {/* Header & Filter Controls Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-border-subtle pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">Melbourne Operations HQ</Badge>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              8 Kitchens Streaming Live
            </span>
          </div>
          <h1 className="mt-1.5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-text-primary">
            Store Performance &amp; Kitchen Feed
          </h1>
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Range Selector */}
          <div className="flex items-center rounded-xl border border-border-subtle bg-bg-surface p-1 shadow-2xs">
            {(
              [
                { id: '7d' as const, label: 'Last 7 Days' },
                { id: '30d' as const, label: '30 Days' },
                { id: '90d' as const, label: '90 Days' },
              ] as const
            ).map((range) => (
              <button
                key={range.id}
                type="button"
                onClick={() => setDateRange(range.id)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer',
                  dateRange === range.id
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-text-secondary hover:text-text-primary',
                )}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Store Filter Selector */}
          <div className="relative">
            <select
              aria-label="Filter by store"
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="appearance-none rounded-xl border border-border-strong bg-bg-surface py-2 pl-3 pr-8 text-xs font-bold text-text-primary focus:border-brand-primary focus:outline-none cursor-pointer shadow-2xs"
            >
              <option value="all">All 8 Melbourne Kitchens</option>
              {MELBOURNE_STORES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.suburb} Kitchen
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          </div>
        </div>
      </div>

      {/* KPI Cards Row (4 cards) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-text-secondary">
            <span>Gross Revenue ({dateRange.toUpperCase()})</span>
            <DollarSign className="h-4 w-4 text-brand-primary" />
          </div>
          <div className="font-display text-2xl font-extrabold text-text-primary">
            {formatAUD(totalRevenue)}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Badge tone="success">+14.2%</Badge>
            <span className="text-text-muted">vs previous period</span>
          </div>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-text-secondary">
            <span>Order Volume</span>
            <ShoppingBag className="h-4 w-4 text-brand-secondary" />
          </div>
          <div className="font-display text-2xl font-extrabold text-text-primary">
            {totalOrdersCount.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Badge tone="success">+9.8%</Badge>
            <span className="text-text-muted">growth rate</span>
          </div>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-text-secondary">
            <span>Average Order Value (AOV)</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="font-display text-2xl font-extrabold text-text-primary">
            {formatAUD(averageOrderValue)}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Badge tone="success">+4.1%</Badge>
            <span className="text-text-muted">incl. 10% GST</span>
          </div>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-text-secondary">
            <span>Store Operations Status</span>
            <Activity className="h-4 w-4 text-amber-500" />
          </div>
          <div className="font-display text-2xl font-extrabold text-text-primary">
            8 / 8 Active
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Badge tone="brand">100% On-Time</Badge>
            <span className="text-text-muted">Avg prep ~7.2m</span>
          </div>
        </Card>
      </div>

      {/* Charts Row 1: Sales & Orders Over Time AreaChart */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-text-primary">
              Sales Revenue &amp; Order Volume Trend
            </h2>
            <p className="text-xs text-text-secondary">
              Audited Australian Dollar figures inclusive of 10% GST across Melbourne.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-brand-primary">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-primary" />
              <span>Revenue (AUD)</span>
            </span>
            <span className="flex items-center gap-1.5 text-blue-500">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <span>Orders</span>
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D9381E" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#D9381E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284C7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0284C7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                tickLine={false}
              />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as (typeof salesData)[0];
                    return (
                      <div className="rounded-xl border border-border-strong bg-bg-surface p-3 text-xs shadow-elevated">
                        <p className="font-bold text-text-primary mb-1">
                          {label} ({data.dayOfWeek})
                        </p>
                        <p className="text-brand-primary font-extrabold">
                          Revenue: {formatAUD(data.revenue)}
                        </p>
                        <p className="text-blue-500 font-bold">Orders: {data.orders}</p>
                        <p className="text-text-muted text-[10px]">AOV: {formatAUD(data.aov)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#D9381E"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGradient)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stroke="#0284C7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#ordersGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Charts Row 2: Peak Rush Hour Heatmap/Bar + Category Share Donut */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Orders by Hour (7 cols) */}
        <Card className="p-6 space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-text-primary">
                Melbourne Peak Rush Hours (24h)
              </h2>
              <p className="text-xs text-text-secondary">
                Highlights the lunch surge (12–2 PM) and dinner surge (6–9 PM).
              </p>
            </div>
            <Badge tone="amber">Peak: 7 PM (513 Orders)</Badge>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HOURLY_RUSH_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={1} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload as (typeof HOURLY_RUSH_DATA)[0];
                      return (
                        <div className="rounded-xl border border-border-strong bg-bg-surface p-3 text-xs shadow-elevated">
                          <p className="font-bold text-text-primary mb-1">Time: {label}</p>
                          <p className="text-brand-primary font-bold">Pickup: {d.pickupOrders}</p>
                          <p className="text-blue-500 font-bold">Delivery: {d.deliveryOrders}</p>
                          <p className="text-text-primary font-extrabold border-t border-border-subtle pt-1 mt-1">
                            Total: {d.totalOrders} orders
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="pickupOrders" stackId="a" fill="#D9381E" radius={[0, 0, 0, 0]} />
                <Bar dataKey="deliveryOrders" stackId="a" fill="#0284C7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Share Donut Chart (5 cols) */}
        <Card className="p-6 space-y-4 lg:col-span-5">
          <div>
            <h2 className="font-display text-lg font-bold text-text-primary">
              Category Revenue Share
            </h2>
            <p className="text-xs text-text-secondary">
              Proportion of total Melbourne fast-food sales by category.
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_SHARE_DATA}
                  dataKey="percentage"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {CATEGORY_SHARE_DATA.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val}% of sales`, `${name}`]}
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-surface, #ffffff)',
                    borderColor: 'var(--color-border-strong, #ccc)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Mini Category Chips */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {CATEGORY_SHARE_DATA.slice(0, 4).map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="font-semibold text-text-primary">{c.name}</span>
                <span className="text-text-muted text-[11px] ml-auto">{c.percentage}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 3: Top Selling Items Leaderboard & Store KPIs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Top Selling Items (7 cols) */}
        <Card className="p-6 space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-text-primary">
                Top-Selling Menu Items Leaderboard
              </h2>
              <p className="text-xs text-text-secondary">
                Ranked by customer orders and total gross revenue.
              </p>
            </div>
            <Badge tone="success">Melbourne Top 5</Badge>
          </div>

          <div className="space-y-3">
            {TOP_SELLING_ITEMS.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-border-subtle bg-bg-surface p-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-bg-elevated font-display font-extrabold text-brand-primary">
                    #{idx + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-text-primary">{item.name}</h3>
                    <p className="text-[11px] text-text-muted">{item.category} • {item.unitsSold.toLocaleString()} sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-text-primary">{formatAUD(item.revenue)}</span>
                  <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{item.growth}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Fulfillment Channel Split (5 cols) */}
        <Card className="p-6 space-y-4 lg:col-span-5">
          <div>
            <h2 className="font-display text-lg font-bold text-text-primary">
              Fulfillment Channel Split
            </h2>
            <p className="text-xs text-text-secondary">
              Order volume distribution across pickup, courier, and kiosk.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {FULFILLMENT_SPLIT_DATA.map((channel) => (
              <div key={channel.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-text-primary">
                  <span>{channel.name}</span>
                  <span>{channel.percentage}% ({channel.value.toLocaleString()} orders)</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-border-subtle">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${channel.percentage}%`,
                      backgroundColor: channel.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border-subtle bg-bg-elevated p-4 text-xs text-text-secondary space-y-1 mt-4">
            <span className="font-bold text-text-primary block">Melbourne Operational Note:</span>
            <span>
              Express Click &amp; Collect curbside lanes in South Yarra and Fitzroy represent the fastest growing channel (+28% MoM).
            </span>
          </div>
        </Card>
      </div>

      {/* Row 4: Live Kitchen Orders Feed & Interactive Management Table */}
      <Card className="p-6 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="font-display text-xl font-bold text-text-primary">
                Live Kitchen Order Gateway ({filteredOrders.length} Orders)
              </h2>
            </div>
            <p className="text-xs text-text-secondary">
              Real-time feed showing all active customer orders. Change status directly in the
              table to test customer notification synchronization.
            </p>
          </div>

          {/* Table Filters: Status & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search orders, names..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="rounded-xl border border-border-strong bg-bg-surface py-1.5 pl-8 pr-3 text-xs font-bold text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none"
              />
            </div>

            <select
              aria-label="Filter orders by status"
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="rounded-xl border border-border-strong bg-bg-surface py-1.5 px-3 text-xs font-bold text-text-primary focus:border-brand-primary focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="received">Received</option>
              <option value="preparing">Preparing</option>
              <option value="ready_or_out">Ready / En Route</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto rounded-2xl border border-border-subtle">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border-subtle bg-bg-elevated text-text-secondary">
              <tr>
                <th className="p-3.5 font-bold">Order #</th>
                <th className="p-3.5 font-bold">Customer</th>
                <th className="p-3.5 font-bold">Kitchen &amp; Method</th>
                <th className="p-3.5 font-bold">Time Placed</th>
                <th className="p-3.5 font-bold">Items</th>
                <th className="p-3.5 font-bold">Total (AUD)</th>
                <th className="p-3.5 font-bold">Kitchen Status (Changeable)</th>
                <th className="p-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle bg-bg-surface">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-text-muted">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-bg-elevated/50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-brand-primary">
                      #{order.orderNumber}
                    </td>
                    <td className="p-3.5 font-bold text-text-primary">
                      {order.customerName}
                    </td>
                    <td className="p-3.5 text-text-secondary">
                      <div className="font-semibold">{order.storeSuburb}</div>
                      <span className="text-[10px] text-text-muted capitalize">
                        {order.fulfillmentMode}
                      </span>
                    </td>
                    <td className="p-3.5 text-text-muted">
                      {formatMelbTime(order.createdAt)}
                    </td>
                    <td className="p-3.5 text-text-primary font-semibold">
                      {order.items.length} items
                    </td>
                    <td className="p-3.5 font-bold text-text-primary">
                      {formatAUD(order.total)}
                    </td>
                    <td className="p-3.5">
                      {/* Interactive Status Changer Dropdown */}
                      <select
                        aria-label={`Update status for order ${order.orderNumber}`}
                        value={order.status}
                        onChange={(e) =>
                          handleUpdateStatus(order.id, e.target.value as OrderStatus)
                        }
                        className={cn(
                          'rounded-lg px-2.5 py-1 text-xs font-bold border focus:outline-none cursor-pointer',
                          order.status === 'completed'
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                            : order.status === 'ready_or_out'
                              ? 'border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300'
                              : order.status === 'preparing'
                                ? 'border-brand-primary/40 bg-brand-primary/10 text-brand-primary'
                                : 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
                        )}
                      >
                        <option value="received">Received</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready_or_out">Ready / En Route</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => setSelectedOrderReceipt(order)}
                      >
                        Receipt
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        Track
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Tax Invoice Modal for Admin */}
      {selectedOrderReceipt && (
        <Modal
          open={Boolean(selectedOrderReceipt)}
          onOpenChange={(open) => !open && setSelectedOrderReceipt(null)}
          title={`Order #${selectedOrderReceipt.orderNumber} • Tax Receipt`}
          description="Merchant record"
        >
          <div className="space-y-3 text-xs">
            <div className="text-center border-b border-border-subtle pb-3">
              <h4 className="font-bold text-sm">Southern Cross Burgers Pty Ltd</h4>
              <p className="text-text-muted">ABN 48 612 904 331</p>
              <p className="text-text-secondary">{selectedOrderReceipt.storeName}</p>
              <p className="text-text-muted">{formatMelbDate(selectedOrderReceipt.createdAt)}</p>
            </div>

            <div className="space-y-1.5 divide-y divide-border-subtle">
              {selectedOrderReceipt.items.map((item) => (
                <div key={item.cartItemId} className="flex justify-between pt-1.5">
                  <span>
                    {item.quantity}x {item.name} ({item.customization.sizeLabel})
                  </span>
                  <span className="font-bold">{formatAUD(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border-subtle pt-2 space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatAUD(selectedOrderReceipt.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{formatAUD(selectedOrderReceipt.deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-text-primary border-t border-border-subtle pt-1 text-sm">
                <span>Total Paid (AUD)</span>
                <span className="text-brand-primary">{formatAUD(selectedOrderReceipt.total)}</span>
              </div>
              <p className="text-[10px] text-text-muted text-right">
                Includes {formatAUD(selectedOrderReceipt.gstIncluded)} 10% Australian GST
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
