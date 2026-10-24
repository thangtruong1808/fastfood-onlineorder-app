import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '@/types';

export const STORAGE_KEY_CART = 'scb_mobile_cart_state';

export interface CartState {
  items: CartItem[];
  promoCode: string | null;
  isCartDrawerOpen: boolean;
}

const initialState: CartState = {
  items: [],
  promoCode: null,
  isCartDrawerOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addCartItem(state, action: PayloadAction<CartItem>) {
      const existingIndex = state.items.findIndex(
        (item) => item.cartItemId === action.payload.cartItemId,
      );
      if (existingIndex >= 0) {
        state.items[existingIndex].quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    updateCartItemQuantity(
      state,
      action: PayloadAction<{ cartItemId: string; quantity: number }>,
    ) {
      const item = state.items.find((i) => i.cartItemId === action.payload.cartItemId);
      if (!item) return;
      if (action.payload.quantity <= 0) {
        state.items = state.items.filter((i) => i.cartItemId !== action.payload.cartItemId);
      } else {
        item.quantity = action.payload.quantity;
      }
    },
    removeCartItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.cartItemId !== action.payload);
    },
    applyPromoCode(state, action: PayloadAction<string | null>) {
      state.promoCode = action.payload ? action.payload.toUpperCase().trim() : null;
    },
    clearCart(state) {
      state.items = [];
      state.promoCode = null;
    },
    setCartDrawerOpen(state, action: PayloadAction<boolean>) {
      state.isCartDrawerOpen = action.payload;
    },
    hydrateCartState(
      state,
      action: PayloadAction<{ items?: CartItem[]; promoCode?: string | null }>,
    ) {
      if (Array.isArray(action.payload.items)) {
        state.items = action.payload.items;
      }
      state.promoCode = action.payload.promoCode ?? null;
    },
  },
});

export const {
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  applyPromoCode,
  clearCart,
  setCartDrawerOpen,
  hydrateCartState,
} = cartSlice.actions;

export default cartSlice.reducer;

