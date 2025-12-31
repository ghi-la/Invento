import type { ReactElement } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import SettingsIcon from '@mui/icons-material/Settings';

export type NavItem = {
  label: string;
  to: string;
  icon: ReactElement;
};

export const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Inventory', to: '/inventory', icon: <Inventory2Icon /> },
  { label: 'Settings', to: '/settings', icon: <SettingsIcon /> },
];
