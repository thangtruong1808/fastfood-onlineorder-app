import { useRouter } from 'expo-router';
import { ArrowLeft, CreditCard } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '@/app/hooks';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { calculateCartTotals } from '@/features/cart/cartSelectors';
import { useTheme } from '@/hooks/useTheme';
import { formatAUD } from '@/lib/currency';

export default function CheckoutPreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const { items, promoCode } = useAppSelector((state) => state.cart);
  const { fulfillmentMode, selectedStoreId } = useAppSelector((state) => state.store);

  const totals = calculateCartTotals({
    items,
    promoCode,
    fulfillmentMode,
    selectedStoreId,
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bgPrimary,
        paddingTop: insets.top,
      }}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft size={14} color={colors.textPrimary} />}
            onPress={() => router.back()}
          >
            Back
          </Button>
          <Badge tone="brand">Checkout Preview (Phase 3 Full Stripe & 3DS)</Badge>
        </View>

        <Card style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <CreditCard size={18} color={colors.brandPrimary} />
            <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '900' }}>
              Order Summary ({totals.itemsCount} Items)
            </Text>
          </View>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            Total Due: {formatAUD(totals.total)} (Includes {formatAUD(totals.gstIncluded)} Australian GST)
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            Full Stripe Test Mode, 3D Secure 2.0 OTP Challenge modal, and Live Order Tracking will be unlocked in Phase 3.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

