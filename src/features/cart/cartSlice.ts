import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '@/types';

const STORAGE_KEY_CART = 'scb_cart_state';

export interface CartState {
  items: CartItem[];
  promoCode: string | null;
  isCartDrawerOpen: boolean;
}

function loadInitialCart(): CartState {
  const fallback: CartState = {
    items: [],
    promoCode: null,
    isCartDrawerOpen: false,
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CART);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<CartState>;
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      promoCode: parsed.promoCode ?? null,
      isCartDrawerOpen: false,
    };
  } catch {
    return fallback;
  }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: loadInitialCart(),
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
  },
});

export const {
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  applyPromoCode,
  clearCart,
  setCartDrawerOpen,
} = cartSlice.actions;

export { STORAGE_KEY_CART };
export default cartSlice.reducer;
