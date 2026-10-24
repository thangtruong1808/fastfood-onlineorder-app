import { Activity, AlertOctagon, RotateCcw, Zap } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  setApiLatency,
  setForceNextApiError,
  setSimulatorExpanded,
} from '@/app/simulatorSlice';
import { useToast } from '@/components/common/ToastProvider';
import { Badge } from '@/components/ui/Badge';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import { mockApi } from '@/services/mockApi';
import type { SimulatorLatency } from '@/types';

const LATENCY_OPTIONS: { value: SimulatorLatency; label: string; desc: string }[] = [
  { value: 0, label: 'Instant (0ms)', desc: 'Zero network delay' },
  { value: 400, label: 'Realistic (400ms)', desc: 'Default 4G Melbourne latency' },
  { value: 1200, label: 'Slow 3G (1.2s)', desc: 'Inspect skeleton loaders' },
];

export function ApiSimulatorModal() {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { showToast } = useToast();

  const { apiLatencyMs, forceNextApiError, isSimulatorExpanded } = useAppSelector(
    (state) => state.simulator,
  );

  const handleLatencyChange = (latency: SimulatorLatency) => {
    dispatch(setApiLatency(latency));
    dispatch(mockApi.util.invalidateTags(['Menu', 'Stores', 'Promos']));
    showToast({
      title: `Mock API latency set to ${latency}ms`,
      description: 'Refetching catalog to demonstrate skeleton loaders.',
      tone: 'info',
    });
  };

  const handleTriggerError = () => {
    dispatch(setForceNextApiError(true));
    dispatch(mockApi.util.invalidateTags(['Menu', 'Promos']));
    dispatch(setSimulatorExpanded(false));
    showToast({
      title: 'Simulated 503 API Error Armed',
      description: 'Active query will fail so you can test the ErrorState recovery UI.',
      tone: 'error',
    });
  };

  const handleRecoverClean = () => {
    dispatch(setForceNextApiError(false));
    dispatch(mockApi.util.invalidateTags(['Menu', 'Stores', 'Promos']));
    dispatch(setSimulatorExpanded(false));
    showToast({
      title: 'Mock API Refetched Cleanly',
      description: 'Melbourne Kitchen Gateway restored.',
      tone: 'success',
    });
  };

  return (
    <BottomSheetModal
      open={isSimulatorExpanded}
      onOpenChange={(open) => dispatch(setSimulatorExpanded(open))}
      title="RTK Query Network Simulator"
      subtitle="Control artificial latency and 503 gateway errors for client demos"
    >
      <View style={{ gap: 18 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.bgElevated,
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Activity size={18} color={colors.brandPrimary} />
            <View>
              <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '800' }}>
                Gateway Status
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                Melbourne Order Gateway (Mock RTK Query)
              </Text>
            </View>
          </View>
          <Badge tone={forceNextApiError ? 'danger' : 'success'}>
            {forceNextApiError ? '503 Error Armed' : `Healthy • ${apiLatencyMs}ms`}
          </Badge>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700' }}>
            Artificial Network Latency (Tests Loading Skeletons)
          </Text>
          <View style={{ gap: 8 }}>
            {LATENCY_OPTIONS.map((opt) => {
              const isSelected = apiLatencyMs === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => handleLatencyChange(opt.value)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 13,
                    borderRadius: 14,
                    borderWidth: 1.5,
                    borderColor: isSelected ? colors.brandPrimary : colors.borderSubtle,
                    backgroundColor: isSelected ? colors.bgElevated : colors.bgSurface,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        color: isSelected ? colors.brandPrimary : colors.textPrimary,
                        fontSize: 13,
                        fontWeight: '800',
                      }}
                    >
                      {opt.label}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                      {opt.desc}
                    </Text>
                  </View>
                  {isSelected ? <Badge tone="brand">Active</Badge> : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Button
              variant="danger"
              fullWidth
              leftIcon={<AlertOctagon size={15} color="#FFFFFF" />}
              onPress={handleTriggerError}
            >
              Simulate 503 Outage
            </Button>
          </View>
          <View style={{ flex: 1 }}>
            <Button
              variant="outline"
              fullWidth
              leftIcon={<RotateCcw size={15} color={colors.textPrimary} />}
              onPress={handleRecoverClean}
            >
              Recover Cleanly
            </Button>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingTop: 4,
          }}
        >
          <Zap size={14} color={colors.brandSecondary} />
          <Text style={{ color: colors.textMuted, fontSize: 11, flex: 1 }}>
            Use this panel during iOS/Android demos to prove skeleton loading and 503 error recovery.
          </Text>
        </View>
      </View>
    </BottomSheetModal>
  );
}

