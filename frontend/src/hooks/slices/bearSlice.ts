import { bear } from "@/types/bear";
import { createSlice } from '@reduxjs/toolkit';

const INITIAL_STATE: bear = {
    bears: 0,
};

const bearSlice = createSlice({
    name: "bear",
    initialState: INITIAL_STATE,
    reducers: {
        increasePopulation: (state) => {
            state.bears += 1;
        },
        removeAllBears: (state) => {
            state.bears = 0;
        },
        updateBears: (state, action) => {
            state.bears = action.payload;
        },
    },
});

export const { increasePopulation, removeAllBears, updateBears } = bearSlice.actions;
export default bearSlice.reducer;