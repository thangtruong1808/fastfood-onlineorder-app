import { Flame, Share2, Sparkles } from 'lucide-react-native';
import React from 'react';
import { Share, Text, View } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import { calculateNetExclGST, formatAUD } from '@/lib/currency';
import { formatMelbDate, formatMelbTime } from '@/lib/date';
import type { OrderRecord } from '@/types';

export interface TaxReceiptModalProps {
  order: OrderRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaxReceiptModal({ order, open, onOpenChange }: TaxReceiptModalProps) {
  const { colors } = useTheme();

  if (!order) return null;

  const netExclGst = calculateNetExclGST(order.total);

  const handleShareReceipt = async () => {
    try {
      await Share.share({
        title: `Southern Cross Burgers Tax Invoice #${order.orderNumber}`,
        message: [
          `SOUTHERN CROSS BURGERS MELBOURNE`,
          `Australian Tax Invoice • ABN 48 612 904 331`,
          `Order: #${order.orderNumber}`,
          `Kitchen: ${order.storeName} (${order.storeSuburb})`,
          `Date: ${formatMelbDate(order.createdAt)} ${formatMelbTime(order.createdAt)}`,
          `Total Paid: ${formatAUD(order.total)} AUD (incl. ${formatAUD(order.gstIncluded)} GST)`,
          `Payment: ${order.paymentMethodLabel}`,
        ].join('\n'),
      });
    } catch {
      // Ignore user share cancellation
    }
  };

  return (
    <BottomSheetModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Tax Invoice • #${order.orderNumber}`}
      subtitle="Australian Tax Invoice (10% GST Included)"
      footer={
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Button
              variant="outline"
              fullWidth
              leftIcon={<Share2 size={15} color={colors.textPrimary} />}
              onPress={handleShareReceipt}
            >
              Share Invoice
            </Button>
          </View>
          <View style={{ flex: 1 }}>
            <Button variant="primary" fullWidth onPress={() => onOpenChange(false)}>
              Done
            </Button>
          </View>
        </View>
      }
    >
      <View
        style={{
          backgroundColor: colors.bgElevated,
          borderColor: colors.borderStrong,
          borderWidth: 1,
          borderRadius: 20,
          padding: 16,
          gap: 14,
        }}
      >
        {/* Brand Header */}
        <View
          style={{
            alignItems: 'center',
            gap: 4,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderSubtle,
          }}
        >
          <View
            style={{
              height: 40,
              width: 40,
              borderRadius: 12,
              backgroundColor: colors.brandPrimary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 4,
            }}
          >
            <Flame size={20} color="#FFFFFF" />
          </View>
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '900' }}>
            Southern Cross Burgers Pty Ltd
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 11 }}>
            ABN 48 612 904 331 • {order.storeName}
          </Text>
          <Badge tone="brand">TAX INVOICE • #{order.orderNumber}</Badge>
        </View>

        {/* Order Metadata */}
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Date & Time</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '700' }}>
              {formatMelbDate(order.createdAt)} • {formatMelbTime(order.createdAt)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Customer</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '700' }}>
              {order.customerName} ({order.customerPhone})
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Fulfillment</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '700' }}>
              {order.fulfillmentMode.toUpperCase()} ({order.scheduledSlot})
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Payment</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '700' }}>
              {order.paymentMethodLabel}
            </Text>
          </View>
        </View>

        {/* Line Items */}
        <View
          style={{
            gap: 8,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: colors.borderSubtle,
          }}
        >
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 11,
              fontWeight: '800',
              textTransform: 'uppercase',
            }}
          >
            Itemized Order
          </Text>

          {order.items.map((item) => (
            <View
              key={item.cartItemId}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              <View style={{ flex: 1 }}>
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
        </View>

        {/* Financial & GST Breakdown */}
        <View style={{ gap: 5 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Subtotal</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '700' }}>
              {formatAUD(order.subtotal)}
            </Text>
          </View>

          {order.discountAmount > 0 ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.statusSuccess, fontSize: 12, fontWeight: '700' }}>
                Promo Discount ({order.promoCode || 'PROMO'})
              </Text>
              <Text style={{ color: colors.statusSuccess, fontSize: 12, fontWeight: '800' }}>
                -{formatAUD(order.discountAmount)}
              </Text>
            </View>
          ) : null}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              Delivery / Service Fee
            </Text>
            <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '700' }}>
              {order.deliveryFee === 0 ? 'FREE' : formatAUD(order.deliveryFee)}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>
              Net Amount (Excl. GST)
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>
              {formatAUD(netExclGst)}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>
              Included Australian GST (10%)
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>
              {formatAUD(order.gstIncluded)}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              paddingTop: 8,
              marginTop: 4,
              borderTopWidth: 1,
              borderTopColor: colors.borderStrong,
            }}
          >
            <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '900' }}>
              Total Paid (AUD)
            </Text>
            <Text style={{ color: colors.brandPrimary, fontSize: 18, fontWeight: '900' }}>
              {formatAUD(order.total)}
            </Text>
          </View>
        </View>

        {/* Loyalty Points Footer */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            backgroundColor: colors.bgSurface,
            borderRadius: 12,
            padding: 10,
          }}
        >
          <Sparkles size={14} color={colors.brandSecondary} />
          <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '800' }}>
            Earned +{order.loyaltyPointsEarned} Flame Rewards Points on this order
          </Text>
        </View>
      </View>
    </BottomSheetModal>
  );
}

