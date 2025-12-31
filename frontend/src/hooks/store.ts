import { configureStore } from '@reduxjs/toolkit';

import appReducer from './slices/appSlice';
import bearReducer from './slices/bearSlice';
import inventoryReducer from './slices/inventorySlice';
import inventoryUiReducer from './slices/inventoryUiSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    bear: bearReducer,
    app: appReducer,
    inventory: inventoryReducer,
    inventoryUi: inventoryUiReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
