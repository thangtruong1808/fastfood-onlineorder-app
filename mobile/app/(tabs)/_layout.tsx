import { Tabs } from 'expo-router';
import {
  BarChart3,
  Compass,
  Home,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react-native';
import React from 'react';
import { Platform, View } from 'react-native';
import { HeaderStoreBar } from '@/components/common/HeaderStoreBar';
import { StickyCartBar } from '@/features/cart/StickyCartBar';
import { useTheme } from '@/hooks/useTheme';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <HeaderStoreBar />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.brandPrimary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.bgSurface,
            borderTopColor: colors.borderSubtle,
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 84 : 64,
            paddingTop: 6,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="menu"
          options={{
            title: 'Menu',
            tabBarIcon: ({ color, size }) => (
              <UtensilsCrossed size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Rewards',
            tabBarIcon: ({ color, size }) => <Sparkles size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="admin"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            title: 'Demo',
            tabBarIcon: ({ color, size }) => <Compass size={size} color={color} />,
          }}
        />
      </Tabs>
      <StickyCartBar />
    </View>
  );
}
