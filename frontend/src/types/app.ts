import { loggedUserType } from './user';

export type notificationType = {
  open: boolean;
  autohideDuration: number | null;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
};

export type warehouseType = {
  id: string;
  label: string;
};

export type appState = {
  notification: notificationType;
  loggedUser: loggedUserType;
  selectedWarehouse: warehouseType;
  triggerReload: boolean;
};
