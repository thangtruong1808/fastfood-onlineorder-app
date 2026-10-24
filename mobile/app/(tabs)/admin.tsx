import { BarChart3, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { SALES_7D, STORE_KPIS } from '@/data/analyticsSeed';
import { useTheme } from '@/hooks/useTheme';
import { formatAUD } from '@/lib/currency';

export default function AdminAnalyticsTabScreen() {
  const { colors } = useTheme();

  const totalRevenue7d = SALES_7D.reduce((sum, r) => sum + r.revenue, 0);
  const totalOrders7d = SALES_7D.reduce((sum, r) => sum + r.orders, 0);
  const avgOrderValue = totalOrders7d > 0 ? totalRevenue7d / totalOrders7d : 30.1;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bgPrimary }}
      contentContainerStyle={{ padding: 16, paddingBottom: 36, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <BarChart3 size={18} color={colors.brandPrimary} />
          <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: '900' }}>
            Melbourne Operations HQ
          </Text>
        </View>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
          8 Inner-Melbourne Kitchens Streaming Live • 7-Day Performance Overview
        </Text>
      </View>

      {/* KPI Summary Grid */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Card style={{ flex: 1, gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700' }}>
              Gross Revenue (7D)
            </Text>
            <DollarSign size={15} color={colors.brandPrimary} />
          </View>
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '900' }}>
            {formatAUD(totalRevenue7d)}
          </Text>
          <Badge tone="success">+14.2% vs last wk</Badge>
        </Card>

        <Card style={{ flex: 1, gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700' }}>
              Total Orders (7D)
            </Text>
            <ShoppingBag size={15} color={colors.brandSecondary} />
          </View>
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '900' }}>
            {totalOrders7d.toLocaleString()}
          </Text>
          <Badge tone="brand">AOV {formatAUD(avgOrderValue)}</Badge>
        </Card>
      </View>

      {/* Store KPIs List */}
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <TrendingUp size={16} color={colors.brandPrimary} />
          <Text style={{ color: colors.textPrimary, fontSize: 17, fontWeight: '800' }}>
            Melbourne Kitchen Performance
          </Text>
        </View>

        {STORE_KPIS.map((store) => (
          <Card key={store.storeId} style={{ gap: 6 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View>
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
                {store.orders.toLocaleString()} orders
              </Text>
              <Text style={{ color: colors.brandPrimary, fontSize: 13, fontWeight: '800' }}>
                {formatAUD(store.revenue)}
              </Text>
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

