import { describe, expect, it } from 'vitest';
import authReducer, { addLoyaltyPoints, switchDemoRole } from '@/features/auth-mock/authSlice';
import { DEMO_PROFILES } from '@/data/promosSeed';

describe('Customer Loyalty Program and Role Switcher', () => {
  it('initializes with Alex Mercer customer profile', () => {
    const initialState = {
      currentUser: DEMO_PROFILES.customer,
      favoriteItemIds: ['itm-southern-cross-signature'],
    };
    expect(initialState.currentUser.name).toBe('Alex Mercer');
    expect(initialState.currentUser.loyaltyTier).toBe('Southern Gold');
  });

  it('switches demo role cleanly between customer, admin, and guest', () => {
    const state = {
      currentUser: DEMO_PROFILES.customer,
      favoriteItemIds: [],
    };

    const nextAdminState = authReducer(state, switchDemoRole('admin'));
    expect(nextAdminState.currentUser.name).toBe('Sarah Chen');
    expect(nextAdminState.currentUser.role).toBe('admin');

    const nextGuestState = authReducer(nextAdminState, switchDemoRole('guest'));
    expect(nextGuestState.currentUser.role).toBe('guest');
  });

  it('advances loyalty tiers dynamically when earning points', () => {
    const state = {
      currentUser: {
        ...DEMO_PROFILES.guest,
        loyaltyPoints: 100,
        loyaltyTier: 'Bronze Star' as const,
      },
      favoriteItemIds: [],
    };

    // Add 450 points -> 550 total -> Silver Cross
    const silverState = authReducer(state, addLoyaltyPoints(450));
    expect(silverState.currentUser.loyaltyPoints).toBe(550);
    expect(silverState.currentUser.loyaltyTier).toBe('Silver Cross');

    // Add 700 points -> 1250 total -> Southern Gold
    const goldState = authReducer(silverState, addLoyaltyPoints(700));
    expect(goldState.currentUser.loyaltyPoints).toBe(1250);
    expect(goldState.currentUser.loyaltyTier).toBe('Southern Gold');
  });
});

