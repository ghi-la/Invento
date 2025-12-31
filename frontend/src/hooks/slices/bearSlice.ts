import { createSlice } from '@reduxjs/toolkit';

export type BearState = {
  count: number;
};

const initialState: BearState = { count: 0 };

const bearSlice = createSlice({
  name: 'bear',
  initialState,
  reducers: {
    increment(state) {
      state.count += 1;
    },
    decrement(state) {
      state.count -= 1;
    },
  },
});

export const { increment, decrement } = bearSlice.actions;
export default bearSlice.reducer;
