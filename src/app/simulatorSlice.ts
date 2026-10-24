import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SimulatorLatency, ThemeMode } from '@/types';

const STORAGE_KEY_THEME = 'scb_theme';

export interface UiSimulatorState {
  theme: ThemeMode;
  apiLatencyMs: SimulatorLatency;
  forceNextApiError: boolean;
  isSimulatorExpanded: boolean;
}

function loadInitialTheme(): ThemeMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_THEME);
    if (!raw) return 'system';
    const parsed = JSON.parse(raw) as ThemeMode;
    if (parsed === 'light' || parsed === 'dark' || parsed === 'system') {
      return parsed;
    }
  } catch {
    // ignore
  }
  return 'system';
}

const initialState: UiSimulatorState = {
  theme: loadInitialTheme(),
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

export { STORAGE_KEY_THEME };
export default simulatorSlice.reducer;
