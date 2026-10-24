import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { DEMO_PROFILES } from '@/data/promosSeed';
import type { UserProfile, UserRole } from '@/types';

const STORAGE_KEY_AUTH = 'scb_auth_role';
const STORAGE_KEY_FAVORITES = 'scb_favorites';

export interface AuthState {
  currentUser: UserProfile;
  favoriteItemIds: string[];
}

function loadInitialRole(): UserRole {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_AUTH) as UserRole | null;
    if (saved && (saved === 'customer' || saved === 'admin' || saved === 'guest')) {
      return saved;
    }
  } catch {
    // ignore storage errors
  }
  return 'customer';
}

function loadInitialFavorites(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_FAVORITES);
    if (saved) {
      return JSON.parse(saved) as string[];
    }
  } catch {
    // ignore
  }
  return ['itm-southern-cross-signature', 'itm-chapel-hot-honey-chicken', 'itm-rosemary-sea-salt-chips'];
}

const initialRole = loadInitialRole();

const initialState: AuthState = {
  currentUser: DEMO_PROFILES[initialRole],
  favoriteItemIds: loadInitialFavorites(),
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
  },
});

export const { switchDemoRole, toggleFavoriteItem, addLoyaltyPoints } = authSlice.actions;
export { STORAGE_KEY_AUTH, STORAGE_KEY_FAVORITES };
export default authSlice.reducer;
