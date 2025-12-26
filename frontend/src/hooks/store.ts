import { configureStore } from "@reduxjs/toolkit";
import bearReducer from "../hooks/slices/bearSlice";

export const store = configureStore({
  reducer: {
    bear: bearReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;