import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { setForceNextApiError, type UiSimulatorState } from '@/app/simulatorSlice';
import { MENU_CATEGORIES, MENU_ITEMS } from '@/data/menuSeed';
import { PROMO_DEALS } from '@/data/promosSeed';
import { MELBOURNE_STORES } from '@/data/storesSeed';
import type { MelbourneStore, MenuCategory, MenuCategoryId, MenuItem, PromoDeal } from '@/types';

interface MockRequestArgs {
  endpoint: 'menu' | 'categories' | 'stores' | 'promos';
  categoryId?: MenuCategoryId | 'all';
}

export interface MockError {
  status: number;
  message: string;
}

interface RootStateWithSimulator {
  simulator: UiSimulatorState;
}

const mockBaseQuery: BaseQueryFn<MockRequestArgs, unknown, MockError> = async (
  args,
  api,
) => {
  const state = api.getState() as RootStateWithSimulator;
  const latency = state.simulator?.apiLatencyMs ?? 400;
  const shouldError = state.simulator?.forceNextApiError ?? false;

  if (latency > 0) {
    await new Promise((resolve) => setTimeout(resolve, latency));
  }

  if (shouldError) {
    api.dispatch(setForceNextApiError(false));
    return {
      error: {
        status: 503,
        message:
          'Simulated Kitchen API Outage (503): Connection to Melbourne Order Gateway timed out. Tap Retry to recover.',
      },
    };
  }

  switch (args.endpoint) {
    case 'menu': {
      const items =
        args.categoryId && args.categoryId !== 'all'
          ? MENU_ITEMS.filter((item) => item.categoryId === args.categoryId)
          : MENU_ITEMS;
      return { data: items };
    }
    case 'categories':
      return { data: MENU_CATEGORIES };
    case 'stores':
      return { data: MELBOURNE_STORES };
    case 'promos':
      return { data: PROMO_DEALS };
    default:
      return {
        error: { status: 404, message: 'Mock endpoint not found' },
      };
  }
};

export const mockApi = createApi({
  reducerPath: 'mockApi',
  baseQuery: mockBaseQuery,
  tagTypes: ['Menu', 'Stores', 'Promos'],
  endpoints: (builder) => ({
    getMenuItems: builder.query<MenuItem[], { categoryId?: MenuCategoryId | 'all' } | void>({
      query: (params) => ({
        endpoint: 'menu',
        categoryId: params ? params.categoryId : 'all',
      }),
      providesTags: ['Menu'],
    }),
    getCategories: builder.query<MenuCategory[], void>({
      query: () => ({ endpoint: 'categories' }),
    }),
    getStores: builder.query<MelbourneStore[], void>({
      query: () => ({ endpoint: 'stores' }),
      providesTags: ['Stores'],
    }),
    getPromoDeals: builder.query<PromoDeal[], void>({
      query: () => ({ endpoint: 'promos' }),
      providesTags: ['Promos'],
    }),
  }),
});

export const {
  useGetMenuItemsQuery,
  useGetCategoriesQuery,
  useGetStoresQuery,
  useGetPromoDealsQuery,
} = mockApi;

