import { useRouter } from 'expo-router';
import {
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Sliders,
  Sparkles,
  User,
  UserCheck,
} from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setSimulatorExpanded } from '@/app/simulatorSlice';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useToast } from '@/components/common/ToastProvider';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DEMO_PROFILES } from '@/data/promosSeed';
import { MELBOURNE_STORES } from '@/data/storesSeed';
import { switchDemoRole } from '@/features/auth-mock/authSlice';
import { setStoreModalOpen } from '@/features/stores/storeSlice';
import { useTheme } from '@/hooks/useTheme';
import type { UserRole } from '@/types';

const PERSONA_CARDS: Array<{
  role: UserRole;
  badge: string;
  desc: string;
  Icon: typeof Sparkles;
}> = [
  {
    role: 'customer',
    badge: 'Southern Gold Member',
    desc: '1,420 Flame Points, saved Fitzroy & CBD addresses, order history & 1-click reorder.',
    Icon: Sparkles,
  },
  {
    role: 'admin',
    badge: 'Regional Ops Manager',
    desc: 'Full access to Melbourne revenue analytics, hourly rush charts & live kitchen orders.',
    Icon: ShieldCheck,
  },
  {
    role: 'guest',
    badge: 'First-Time Visitor',
    desc: 'Clean guest experience for demonstrating first-time Melbourne checkout flows.',
    Icon: User,
  },
];

export default function DemoAndSettingsTabScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { colors } = useTheme();
  const { showToast } = useToast();

  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const { selectedStoreId, fulfillmentMode } = useAppSelector((state) => state.store);
  const { apiLatencyMs, forceNextApiError } = useAppSelector((state) => state.simulator);

  const activeStore =
    MELBOURNE_STORES.find((s) => s.id === selectedStoreId) ?? MELBOURNE_STORES[0];

  const handleSelectPersona = (role: UserRole) => {
    dispatch(switchDemoRole(role));
    const profile = DEMO_PROFILES[role];
    showToast({
      title: `Signed in as ${profile.name} (${role.toUpperCase()})`,
      description: `Switched active mobile persona to ${role}.`,
      tone: 'success',
    });

    if (role === 'admin') {
      router.push('/(tabs)/admin');
    } else if (role === 'customer') {
      router.push('/(tabs)/orders');
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bgPrimary }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ gap: 4 }}>
        <Badge tone="brand">1-Tap Demo Role & Environment Switcher</Badge>
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 24,
            fontWeight: '900',
            marginTop: 4,
          }}
        >
          Choose Your Showcase Persona
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 19 }}>
          Instantly switch between our loyal Melbourne Customer account, Regional Store
          Operations Admin, or Guest to experience every workflow.
        </Text>
      </View>

      {/* 3 Persona Cards */}
      <View style={{ gap: 12 }}>
        {PERSONA_CARDS.map(({ role, badge, desc, Icon }) => {
          const profile = DEMO_PROFILES[role];
          const isCurrent = currentUser.role === role;

          return (
            <Card
              key={role}
              interactive
              onPress={() => handleSelectPersona(role)}
              style={{
                borderColor: isCurrent ? colors.brandPrimary : colors.borderSubtle,
                borderWidth: isCurrent ? 2 : 1,
                gap: 10,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View
                    style={{
                      height: 40,
                      width: 40,
                      borderRadius: 12,
                      backgroundColor: colors.bgElevated,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={20} color={colors.brandPrimary} />
                  </View>
                  <View>
                    <Badge tone="amber">{badge}</Badge>
                    <Text
                      style={{
                        color: colors.textPrimary,
                        fontSize: 16,
                        fontWeight: '800',
                        marginTop: 3,
                      }}
                    >
                      {profile.name}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                      {profile.email || 'No account required'}
                    </Text>
                  </View>
                </View>

                {isCurrent ? (
                  <Badge tone="success">
                    <CheckCircle2 size={12} color={colors.statusSuccess} />
                    <Text
                      style={{
                        color: colors.statusSuccess,
                        fontSize: 11,
                        fontWeight: '700',
                      }}
                    >
                      Active
                    </Text>
                  </Badge>
                ) : null}
              </View>

              <Text style={{ color: colors.textSecondary, fontSize: 12, lineHeight: 18 }}>
                {desc}
              </Text>

              <Button
                variant={isCurrent ? 'outline' : 'primary'}
                size="sm"
                fullWidth
                leftIcon={
                  <UserCheck
                    size={15}
                    color={isCurrent ? colors.textPrimary : '#FFFFFF'}
                  />
                }
                onPress={() => handleSelectPersona(role)}
              >
                {isCurrent
                  ? 'Currently Active Persona'
                  : `Switch to ${profile.name.split(' ')[0]}`}
              </Button>
            </Card>
          );
        })}
      </View>

      {/* Appearance & Theme Controls */}
      <Card style={{ gap: 12 }}>
        <View>
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '800' }}>
            Color Theme & Appearance
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
            Switch between Warm Brioche (Light), Midnight Charcoal (Dark), or System preference.
          </Text>
        </View>
        <ThemeToggle />
      </Card>

      {/* Active Melbourne Store & RTK Query Simulator Controls */}
      <Card style={{ gap: 12 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '800' }}>
              Active Melbourne Kitchen
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
              {activeStore.name} ({fulfillmentMode.toUpperCase()})
            </Text>
          </View>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<MapPin size={14} color={colors.brandPrimary} />}
            onPress={() => dispatch(setStoreModalOpen(true))}
          >
            Change
          </Button>
        </View>

        <View
          style={{
            height: 1,
            backgroundColor: colors.borderSubtle,
          }}
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '800' }}>
              RTK Query API Simulator
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
              Latency: {apiLatencyMs}ms • 503 Outage: {forceNextApiError ? 'Armed' : 'Off'}
            </Text>
          </View>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Sliders size={14} color={colors.brandPrimary} />}
            onPress={() => dispatch(setSimulatorExpanded(true))}
          >
            Configure
          </Button>
        </View>
      </Card>
    </ScrollView>
  );
}

