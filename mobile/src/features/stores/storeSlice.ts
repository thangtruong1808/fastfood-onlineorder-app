import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { MELBOURNE_STORES } from '@/data/storesSeed';
import type { FulfillmentMode } from '@/types';
import { FULFILLMENT_MODES } from '@/types';

export const STORAGE_KEY_STORE_STATE = 'scb_mobile_store_state';

export interface StoreState {
  selectedStoreId: string;
  fulfillmentMode: FulfillmentMode;
  deliveryAddress: string;
  deliverySuburb: string;
  deliveryPostcode: string;
  isStoreModalOpen: boolean;
}

const initialState: StoreState = {
  selectedStoreId: MELBOURNE_STORES[0].id,
  fulfillmentMode: FULFILLMENT_MODES.PICKUP,
  deliveryAddress: '42 Napier Street, Apt 3B',
  deliverySuburb: 'Fitzroy',
  deliveryPostcode: '3065',
  isStoreModalOpen: false,
};

const storeSlice = createSlice({
  name: 'store',
  initialState,
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
    hydrateStoreState(state, action: PayloadAction<Partial<StoreState>>) {
      const exists = MELBOURNE_STORES.some((s) => s.id === action.payload.selectedStoreId);
      if (exists && action.payload.selectedStoreId) {
        state.selectedStoreId = action.payload.selectedStoreId;
      }
      if (action.payload.fulfillmentMode) {
        state.fulfillmentMode = action.payload.fulfillmentMode;
      }
      if (action.payload.deliveryAddress) {
        state.deliveryAddress = action.payload.deliveryAddress;
      }
      if (action.payload.deliverySuburb) {
        state.deliverySuburb = action.payload.deliverySuburb;
      }
      if (action.payload.deliveryPostcode) {
        state.deliveryPostcode = action.payload.deliveryPostcode;
      }
    },
  },
});

export const {
  setSelectedStore,
  setFulfillmentMode,
  setDeliveryDetails,
  setStoreModalOpen,
  hydrateStoreState,
} = storeSlice.actions;

export default storeSlice.reducer;

