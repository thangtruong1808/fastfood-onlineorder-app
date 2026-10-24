import { configureStore, type Middleware } from '@reduxjs/toolkit';
import simulatorReducer, { STORAGE_KEY_THEME } from '@/app/simulatorSlice';
import authReducer, {
  STORAGE_KEY_AUTH,
  STORAGE_KEY_FAVORITES,
} from '@/features/auth-mock/authSlice';
import cartReducer, { STORAGE_KEY_CART } from '@/features/cart/cartSlice';
import ordersReducer, { STORAGE_KEY_ORDERS } from '@/features/orders/ordersSlice';
import storeReducer, { STORAGE_KEY_STORE_STATE } from '@/features/stores/storeSlice';
import { mockApi } from '@/services/mockApi';

const localStoragePersistenceMiddleware: Middleware = (storeApi) => (next) => (action) => {
  const result = next(action);
  const state = storeApi.getState() as RootState;

  try {
    localStorage.setItem(STORAGE_KEY_THEME, JSON.stringify(state.simulator.theme));
    localStorage.setItem(
      STORAGE_KEY_STORE_STATE,
      JSON.stringify({
        selectedStoreId: state.store.selectedStoreId,
        fulfillmentMode: state.store.fulfillmentMode,
        deliveryAddress: state.store.deliveryAddress,
        deliverySuburb: state.store.deliverySuburb,
        deliveryPostcode: state.store.deliveryPostcode,
      }),
    );
    localStorage.setItem(STORAGE_KEY_AUTH, state.auth.currentUser.role);
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(state.auth.favoriteItemIds));
    localStorage.setItem(
      STORAGE_KEY_CART,
      JSON.stringify({
        items: state.cart.items,
        promoCode: state.cart.promoCode,
      }),
    );
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(state.orders.orders));
  } catch {
    // Ignore quota or private-browsing storage restrictions
  }

  return result;
};

export const store = configureStore({
  reducer: {
    simulator: simulatorReducer,
    store: storeReducer,
    auth: authReducer,
    cart: cartReducer,
    orders: ordersReducer,
    [mockApi.reducerPath]: mockApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(mockApi.middleware)
      .concat(localStoragePersistenceMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
