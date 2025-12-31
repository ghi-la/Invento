import { configureStore } from "@reduxjs/toolkit";
import appReducer from '../hooks/slices/appSlice';
import bearReducer from "../hooks/slices/bearSlice";

export const store = configureStore({
  reducer: {
    bear: bearReducer,
    app: appReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;