
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
    role: 'user',
  },
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
  },
});

export const { sendNotification, closeNotification, setLoggedUser } = appSlice.actions;
export default appSlice.reducer;