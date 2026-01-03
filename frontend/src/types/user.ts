import { warehouseType } from './app';

export type loggedUserType = {
  id: string;
  username: string;
  email: string;
  warehouses?: warehouseType[];
  preferences: {
    theme: 'light' | 'dark';
    selectedWarehouse: warehouseType;
  };
  role: 'admin' | 'user';
};
