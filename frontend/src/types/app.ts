import { loggedUserType } from './user';

export type notificationType = {
  open: boolean;
  autohideDuration: number | null;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
};

export type warehouseType = {
  _id?: string;
  name: string;
  code?: string;
  // address: {
  //   street: string;
  //   city: string;
  //   state: string;
  //   country: string;
  //   zipCode: string;
  // };
  // manager: { id: string; username: string; email: string } | null;
  // capacity: number;
  // isActive: boolean;
  // createdBy: {
  //   id: string;
  //   username: string;
  //   email: string;
  // };
};

export type appState = {
  notification: notificationType;
  loggedUser: loggedUserType;
  selectedWarehouse: warehouseType;
  triggerReload: boolean;
};
