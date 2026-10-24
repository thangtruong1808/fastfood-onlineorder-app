import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { DEMO_PROFILES } from '@/data/promosSeed';
import type { UserProfile, UserRole } from '@/types';

export const STORAGE_KEY_AUTH = 'scb_mobile_auth_role';
export const STORAGE_KEY_FAVORITES = 'scb_mobile_favorites';

export interface AuthState {
  currentUser: UserProfile;
  favoriteItemIds: string[];
}

const DEFAULT_FAVORITES = [
  'itm-southern-cross-signature',
  'itm-chapel-hot-honey-chicken',
  'itm-rosemary-sea-salt-chips',
];

const initialState: AuthState = {
  currentUser: DEMO_PROFILES.customer,
  favoriteItemIds: DEFAULT_FAVORITES,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    switchDemoRole(state, action: PayloadAction<UserRole>) {
      state.currentUser = DEMO_PROFILES[action.payload];
    },
    toggleFavoriteItem(state, action: PayloadAction<string>) {
      const id = action.payload;
      const idx = state.favoriteItemIds.indexOf(id);
      if (idx >= 0) {
        state.favoriteItemIds.splice(idx, 1);
      } else {
        state.favoriteItemIds.push(id);
      }
    },
    addLoyaltyPoints(state, action: PayloadAction<number>) {
      state.currentUser.loyaltyPoints += action.payload;
      if (state.currentUser.loyaltyPoints >= 1200) {
        state.currentUser.loyaltyTier = 'Southern Gold';
      } else if (state.currentUser.loyaltyPoints >= 500) {
        state.currentUser.loyaltyTier = 'Silver Cross';
      } else {
        state.currentUser.loyaltyTier = 'Bronze Star';
      }
    },
    hydrateFavorites(state, action: PayloadAction<string[]>) {
      if (Array.isArray(action.payload)) {
        state.favoriteItemIds = action.payload;
      }
    },
  },
});

export const {
  switchDemoRole,
  toggleFavoriteItem,
  addLoyaltyPoints,
  hydrateFavorites,
} = authSlice.actions;

export default authSlice.reducer;

