import React from 'react';
import { Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
  Line as SvgLine,
} from 'react-native-svg';
import type {
  CategoryShareRecord,
  DailySalesRecord,
  HourlyRushRecord,
} from '@/data/analyticsSeed';
import { useTheme } from '@/hooks/useTheme';
import { formatAUD } from '@/lib/currency';

export function RevenueTrendChart({ data }: { data: DailySalesRecord[] }) {
  const { colors } = useTheme();

  if (!data || data.length === 0) return null;

  const chartWidth = 310;
  const chartHeight = 140;
  const padX = 16;
  const padY = 18;
  const innerW = chartWidth - padX * 2;
  const innerH = chartHeight - padY * 2;

  const revenues = data.map((d) => d.revenue);
  const maxRev = Math.max(...revenues, 1);
  const minRev = Math.min(...revenues, 0) * 0.85;
  const range = Math.max(maxRev - minRev, 1);

  const points = data.map((d, idx) => {
    const x =
      padX + (data.length === 1 ? innerW / 2 : (idx / (data.length - 1)) * innerW);
    const y = padY + innerH - ((d.revenue - minRev) / range) * innerH;
    return { x, y, record: d };
  });

  const linePath = points
    .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(
    padY + innerH
  ).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padY + innerH).toFixed(1)} Z`;

  return (
    <View style={{ gap: 10 }}>
      <View style={{ alignItems: 'center' }}>
        <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          <Defs>
            <LinearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={colors.brandPrimary} stopOpacity="0.38" />
              <Stop offset="100%" stopColor={colors.brandPrimary} stopOpacity="0.02" />
            </LinearGradient>
          </Defs>

          {/* Horizontal Reference Grid Lines */}
          {[0.2, 0.5, 0.8].map((ratio) => (
            <SvgLine
              key={ratio}
              x1={padX}
              y1={padY + innerH * ratio}
              x2={chartWidth - padX}
              y2={padY + innerH * ratio}
              stroke={colors.borderSubtle}
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          ))}

          {/* Area Fill & Trend Line */}
          <Path d={areaPath} fill="url(#revGrad)" />
          <Path
            d={linePath}
            fill="none"
            stroke={colors.brandPrimary}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Nodes */}
          {points.map((pt) => (
            <Circle
              key={pt.record.date}
              cx={pt.x}
              cy={pt.y}
              r="4.5"
              fill={colors.bgSurface}
              stroke={colors.brandPrimary}
              strokeWidth="2.5"
            />
          ))}
        </Svg>
      </View>

      {/* X-Axis Labels & Values */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 4,
        }}
      >
        {data.map((d) => (
          <View key={d.date} style={{ alignItems: 'center', gap: 2 }}>
            <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '700' }}>
              {d.dayOfWeek.slice(0, 3)}
            </Text>
            <Text style={{ color: colors.textPrimary, fontSize: 10, fontWeight: '800' }}>
              ${Math.round(d.revenue / 1000)}k
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function HourlyRushChart({ data }: { data: HourlyRushRecord[] }) {
  const { colors } = useTheme();

  // Select key Melbourne operational hours so bars fit cleanly on mobile screens
  const keyHours = data.filter((_, idx) => idx % 2 === 1 || data[idx].totalOrders >= 350);
  const maxOrders = Math.max(...keyHours.map((d) => d.totalOrders), 1);

  return (
    <View style={{ gap: 12 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          height: 132,
          paddingTop: 16,
          paddingHorizontal: 4,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderSubtle,
        }}
      >
        {keyHours.map((slot) => {
          const pickupHeight = Math.max(
            6,
            Math.round((slot.pickupOrders / maxOrders) * 96),
          );
          const deliveryHeight = Math.max(
            6,
            Math.round((slot.deliveryOrders / maxOrders) * 96),
          );

          return (
            <View
              key={slot.hour}
              style={{
                alignItems: 'center',
                gap: 4,
                flex: 1,
              }}
            >
              <Text style={{ color: colors.textMuted, fontSize: 9, fontWeight: '700' }}>
                {slot.totalOrders}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-end',
                  gap: 2,
                }}
              >
                <View
                  style={{
                    width: 7,
                    height: pickupHeight,
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4,
                    backgroundColor: colors.brandPrimary,
                  }}
                />
                <View
                  style={{
                    width: 7,
                    height: deliveryHeight,
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4,
                    backgroundColor: '#0284C7',
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* X-Axis Hour Labels */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {keyHours.map((slot) => (
          <Text
            key={slot.hour}
            style={{
              flex: 1,
              textAlign: 'center',
              color: colors.textSecondary,
              fontSize: 9,
              fontWeight: '700',
            }}
          >
            {slot.hour.replace(' ', '')}
          </Text>
        ))}
      </View>

      {/* Legend */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View
            style={{
              height: 10,
              width: 10,
              borderRadius: 3,
              backgroundColor: colors.brandPrimary,
            }}
          />
          <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700' }}>
            Click & Collect Pickup
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View
            style={{
              height: 10,
              width: 10,
              borderRadius: 3,
              backgroundColor: '#0284C7',
            }}
          />
          <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700' }}>
            Melbourne Courier Delivery
          </Text>
        </View>
      </View>
    </View>
  );
}

export function CategoryShareBreakdown({ data }: { data: CategoryShareRecord[] }) {
  const { colors } = useTheme();

  return (
    <View style={{ gap: 10 }}>
      {data.map((cat) => (
        <View key={cat.name} style={{ gap: 4 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={{
                  height: 10,
                  width: 10,
                  borderRadius: 5,
                  backgroundColor: cat.color,
                }}
              />
              <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '800' }}>
                {cat.name}
              </Text>
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700' }}>
              {formatAUD(cat.revenue)} ({cat.percentage}%)
            </Text>
          </View>

          <View
            style={{
              height: 7,
              borderRadius: 999,
              backgroundColor: colors.bgMuted,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${cat.percentage}%`,
                backgroundColor: cat.color,
                borderRadius: 999,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

export function FulfillmentSplitBar({
  data,
}: {
  data: Array<{ name: string; percentage: number; value: number; color: string }>;
}) {
  const { colors } = useTheme();

  return (
    <View style={{ gap: 12 }}>
      {/* Multi-segment bar */}
      <View
        style={{
          flexDirection: 'row',
          height: 14,
          borderRadius: 999,
          overflow: 'hidden',
          gap: 2,
        }}
      >
        {data.map((seg) => (
          <View
            key={seg.name}
            style={{
              flex: seg.percentage,
              backgroundColor: seg.color,
            }}
          />
        ))}
      </View>

      {/* Breakdown Rows */}
      <View style={{ gap: 8 }}>
        {data.map((seg) => (
          <View
            key={seg.name}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={{
                  height: 10,
                  width: 10,
                  borderRadius: 5,
                  backgroundColor: seg.color,
                }}
              />
              <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '700' }}>
                {seg.name}
              </Text>
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '800' }}>
              {seg.percentage}% ({seg.value.toLocaleString()} orders)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

