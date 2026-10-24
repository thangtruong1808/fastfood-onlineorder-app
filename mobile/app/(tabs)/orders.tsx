import { Clock, Heart, MapPin, Sparkles } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useAppSelector } from '@/app/hooks';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/useTheme';
import { formatAUD } from '@/lib/currency';
import { formatMelbDate, formatMelbTime } from '@/lib/date';

export default function OrdersAndRewardsTabScreen() {
  const { colors } = useTheme();
  const { currentUser, favoriteItemIds } = useAppSelector((state) => state.auth);
  const orders = useAppSelector((state) => state.orders.orders);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bgPrimary }}
      contentContainerStyle={{ padding: 16, paddingBottom: 36, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Customer Loyalty Hero Card */}
      <View
        style={{
          borderRadius: 24,
          backgroundColor: '#1F1714',
          padding: 20,
          gap: 12,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                height: 48,
                width: 48,
                borderRadius: 16,
                backgroundColor: colors.brandPrimary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '900' }}>
                {currentUser.avatarInitials}
              </Text>
            </View>
            <View>
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '900' }}>
                {currentUser.name}
              </Text>
              <Text style={{ color: 'rgba(254, 243, 199, 0.75)', fontSize: 12 }}>
                {currentUser.email || 'Guest Session'}
              </Text>
            </View>
          </View>

          <Badge tone="amber">{currentUser.loyaltyTier}</Badge>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            padding: 14,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} color="#FBBF24" />
            <Text style={{ color: '#FDE68A', fontSize: 12, fontWeight: '700' }}>
              Flame Rewards Balance
            </Text>
          </View>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '900' }}>
            {currentUser.loyaltyPoints.toLocaleString()} pts
          </Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Card style={{ flex: 1, gap: 4 }}>
          <Clock size={16} color={colors.brandPrimary} />
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '900' }}>
            {orders.length}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
            Melbourne Orders
          </Text>
        </Card>
        <Card style={{ flex: 1, gap: 4 }}>
          <Heart size={16} color={colors.brandPrimary} />
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '900' }}>
            {favoriteItemIds.length}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
            Saved Favorites
          </Text>
        </Card>
        <Card style={{ flex: 1, gap: 4 }}>
          <MapPin size={16} color={colors.brandPrimary} />
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '900' }}>
            {currentUser.savedAddresses.length}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
            Addresses
          </Text>
        </Card>
      </View>

      {/* Seeded Order History Preview */}
      <View style={{ gap: 10 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 17, fontWeight: '800' }}>
          Active & Recent Melbourne Orders
        </Text>
        {orders.map((order) => (
          <Card key={order.id} style={{ gap: 8 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Badge tone="brand">Order #{order.orderNumber}</Badge>
              <Badge tone="amber">{order.status.toUpperCase()}</Badge>
            </View>
            <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '800' }}>
              {order.storeName}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              Placed {formatMelbDate(order.createdAt)} at {formatMelbTime(order.createdAt)} •{' '}
              {order.items.length} items • {formatAUD(order.total)}
            </Text>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

