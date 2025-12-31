import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type AppState = {
  // Use this to trigger refetches / refresh UI after mutations.
  triggerReload: number;
};

const initialState: AppState = {
  triggerReload: 0,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    bumpReload(state) {
      state.triggerReload += 1;
    },
    setTriggerReload(state, action: PayloadAction<number>) {
      state.triggerReload = action.payload;
    },
  },
});

export const { bumpReload, setTriggerReload } = appSlice.actions;
export default appSlice.reducer;
