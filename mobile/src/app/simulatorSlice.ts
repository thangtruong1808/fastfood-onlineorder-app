import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SimulatorLatency, ThemeMode } from '@/types';

export const STORAGE_KEY_THEME = 'scb_mobile_theme';

export interface UiSimulatorState {
  theme: ThemeMode;
  apiLatencyMs: SimulatorLatency;
  forceNextApiError: boolean;
  isSimulatorExpanded: boolean;
}

const initialState: UiSimulatorState = {
  theme: 'system',
  apiLatencyMs: 400,
  forceNextApiError: false,
  isSimulatorExpanded: false,
};

const simulatorSlice = createSlice({
  name: 'simulator',
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload;
    },
    setApiLatency(state, action: PayloadAction<SimulatorLatency>) {
      state.apiLatencyMs = action.payload;
    },
    setForceNextApiError(state, action: PayloadAction<boolean>) {
      state.forceNextApiError = action.payload;
    },
    setSimulatorExpanded(state, action: PayloadAction<boolean>) {
      state.isSimulatorExpanded = action.payload;
    },
  },
});

export const {
  setThemeMode,
  setApiLatency,
  setForceNextApiError,
  setSimulatorExpanded,
} = simulatorSlice.actions;

export default simulatorSlice.reducer;

