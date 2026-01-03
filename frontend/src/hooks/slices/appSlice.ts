import { appState } from '@/types/app';
import { createSlice } from '@reduxjs/toolkit';

const INITIAL_STATE: appState = {
  notification: {
    open: false,
    autohideDuration: null,
    message: '',
    severity: 'info',
  },
  loggedUser: {
    id: '',
    username: '',
    email: '',
    warehouses: [],
    preferences: {
      theme: 'light',
      selectedWarehouse: {
        _id: '',
        name: '',
      },
    },
    role: 'admin',
  },
  selectedWarehouse: {
    _id: '',
    name: '',
  },
  triggerReload: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState: INITIAL_STATE,
  reducers: {
    sendNotification: (state, action) => {
      state.notification = {
        open: true,
        ...action.payload,
      };
    },
    closeNotification: (state) => {
      state.notification.open = false;
    },
    setLoggedUser: (state, action) => {
      state.loggedUser = action.payload;
    },
    setSelectedWarehouse: (state, action) => {
      state.selectedWarehouse = action.payload;
    },
    triggerAppReload: (state) => {
      state.triggerReload = !state.triggerReload;
    },
  },
});

export const {
  sendNotification,
  closeNotification,
  setLoggedUser,
  setSelectedWarehouse,
  triggerAppReload,
} = appSlice.actions;
export default appSlice.reducer;
