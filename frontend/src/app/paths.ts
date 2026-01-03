import Login from '@/features/Account/Login';
import Register from '@/features/Account/Register';
import Dashboard from '@/features/Dashboard/Dashboard';
import Inventory from '@/features/Inventory/Inventory';
import { ComponentType } from 'react';

type Path = {
  path: string;
  name: string;
  isLoggedInRequired?: boolean;
  component: ComponentType<any>;
};

export const paths: Path[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    isLoggedInRequired: true,
    component: Dashboard,
  },
  {
    path: '/inventory',
    name: 'Inventory',
    isLoggedInRequired: true,
    component: Inventory,
  },
  {
    path: '/login',
    name: 'Login',
    isLoggedInRequired: false,
    component: Login,
  },
  {
    path: '/register',
    name: 'Register',
    isLoggedInRequired: false,
    component: Register,
  },
];
