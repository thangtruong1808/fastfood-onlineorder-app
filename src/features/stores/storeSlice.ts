import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { MELBOURNE_STORES } from '@/data/storesSeed';
import type { FulfillmentMode } from '@/types';
import { FULFILLMENT_MODES } from '@/types';

const STORAGE_KEY_STORE = 'scb_store_state';

export interface StoreState {
  selectedStoreId: string;
  fulfillmentMode: FulfillmentMode;
  deliveryAddress: string;
  deliverySuburb: string;
  deliveryPostcode: string;
  isStoreModalOpen: boolean;
}

function loadInitialStoreState(): StoreState {
  const fallback: StoreState = {
    selectedStoreId: MELBOURNE_STORES[0].id,
    fulfillmentMode: FULFILLMENT_MODES.PICKUP,
    deliveryAddress: '42 Napier Street, Apt 3B',
    deliverySuburb: 'Fitzroy',
    deliveryPostcode: '3065',
    isStoreModalOpen: false,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY_STORE);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<StoreState>;
    const exists = MELBOURNE_STORES.some((s) => s.id === parsed.selectedStoreId);
    return {
      ...fallback,
      ...parsed,
      selectedStoreId: exists && parsed.selectedStoreId ? parsed.selectedStoreId : fallback.selectedStoreId,
      isStoreModalOpen: false,
    };
  } catch {
    return fallback;
  }
}

const storeSlice = createSlice({
  name: 'store',
  initialState: loadInitialStoreState(),
  reducers: {
    setSelectedStore(state, action: PayloadAction<string>) {
      state.selectedStoreId = action.payload;
    },
    setFulfillmentMode(state, action: PayloadAction<FulfillmentMode>) {
      state.fulfillmentMode = action.payload;
    },
    setDeliveryDetails(
      state,
      action: PayloadAction<{ address: string; suburb: string; postcode: string }>,
    ) {
      state.deliveryAddress = action.payload.address;
      state.deliverySuburb = action.payload.suburb;
      state.deliveryPostcode = action.payload.postcode;
    },
    setStoreModalOpen(state, action: PayloadAction<boolean>) {
      state.isStoreModalOpen = action.payload;
    },
  },
});

export const {
  setSelectedStore,
  setFulfillmentMode,
  setDeliveryDetails,
  setStoreModalOpen,
} = storeSlice.actions;

export const STORAGE_KEY_STORE_STATE = STORAGE_KEY_STORE;
export default storeSlice.reducer;
