import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore, type Middleware } from '@reduxjs/toolkit';
import simulatorReducer, {
  setThemeMode,
  STORAGE_KEY_THEME,
} from '@/app/simulatorSlice';
import authReducer, {
  hydrateFavorites,
  STORAGE_KEY_AUTH,
  STORAGE_KEY_FAVORITES,
  switchDemoRole,
} from '@/features/auth-mock/authSlice';
import cartReducer, {
  hydrateCartState,
  STORAGE_KEY_CART,
} from '@/features/cart/cartSlice';
import ordersReducer, {
  hydrateOrders,
  STORAGE_KEY_ORDERS,
} from '@/features/orders/ordersSlice';
import storeReducer, {
  hydrateStoreState,
  STORAGE_KEY_STORE_STATE,
  type StoreState,
} from '@/features/stores/storeSlice';
import { mockApi } from '@/services/mockApi';
import type { CartItem, OrderRecord, ThemeMode, UserRole } from '@/types';

let isHydrated = false;

const asyncStoragePersistenceMiddleware: Middleware = (storeApi) => (next) => (action) => {
  const result = next(action);
  if (!isHydrated) return result;

  const state = storeApi.getState() as RootState;

  void (async () => {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEY_THEME, JSON.stringify(state.simulator.theme)],
        [
          STORAGE_KEY_STORE_STATE,
          JSON.stringify({
            selectedStoreId: state.store.selectedStoreId,
            fulfillmentMode: state.store.fulfillmentMode,
            deliveryAddress: state.store.deliveryAddress,
            deliverySuburb: state.store.deliverySuburb,
            deliveryPostcode: state.store.deliveryPostcode,
          }),
        ],
        [STORAGE_KEY_AUTH, state.auth.currentUser.role],
        [STORAGE_KEY_FAVORITES, JSON.stringify(state.auth.favoriteItemIds)],
        [
          STORAGE_KEY_CART,
          JSON.stringify({
            items: state.cart.items,
            promoCode: state.cart.promoCode,
          }),
        ],
        [STORAGE_KEY_ORDERS, JSON.stringify(state.orders.orders)],
      ]);
    } catch {
      // Ignore storage write errors
    }
  })();

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
      .concat(asyncStoragePersistenceMiddleware),
});

export async function hydrateStoreFromAsyncStorage(): Promise<void> {
  try {
    const entries = await AsyncStorage.multiGet([
      STORAGE_KEY_THEME,
      STORAGE_KEY_STORE_STATE,
      STORAGE_KEY_AUTH,
      STORAGE_KEY_FAVORITES,
      STORAGE_KEY_CART,
      STORAGE_KEY_ORDERS,
    ]);

    const map = new Map(entries);

    const rawTheme = map.get(STORAGE_KEY_THEME);
    if (rawTheme) {
      const parsedTheme = JSON.parse(rawTheme) as ThemeMode;
      if (parsedTheme === 'light' || parsedTheme === 'dark' || parsedTheme === 'system') {
        store.dispatch(setThemeMode(parsedTheme));
      }
    }

    const rawStore = map.get(STORAGE_KEY_STORE_STATE);
    if (rawStore) {
      const parsedStore = JSON.parse(rawStore) as Partial<StoreState>;
      store.dispatch(hydrateStoreState(parsedStore));
    }

    const rawRole = map.get(STORAGE_KEY_AUTH) as UserRole | null | undefined;
    if (rawRole === 'customer' || rawRole === 'admin' || rawRole === 'guest') {
      store.dispatch(switchDemoRole(rawRole));
    }

    const rawFavs = map.get(STORAGE_KEY_FAVORITES);
    if (rawFavs) {
      const parsedFavs = JSON.parse(rawFavs) as string[];
      store.dispatch(hydrateFavorites(parsedFavs));
    }

    const rawCart = map.get(STORAGE_KEY_CART);
    if (rawCart) {
      const parsedCart = JSON.parse(rawCart) as { items?: CartItem[]; promoCode?: string | null };
      store.dispatch(hydrateCartState(parsedCart));
    }

    const rawOrders = map.get(STORAGE_KEY_ORDERS);
    if (rawOrders) {
      const parsedOrders = JSON.parse(rawOrders) as OrderRecord[];
      store.dispatch(hydrateOrders(parsedOrders));
    }
  } catch {
    // Ignore storage hydration errors
  } finally {
    isHydrated = true;
  }
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

