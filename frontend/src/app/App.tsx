import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import AppShell from '@/layouts/AppShell/AppShell';
import DashboardPage from '@/pages/DashboardPage';
import HomePage from '@/pages/HomePage';
import InventoryPage from '@/pages/InventoryPage';
import ItemDetailPage from '@/pages/ItemDetailPage';
import LoginPage from '@/pages/LoginPage';
import SettingsPage from '@/pages/SettingsPage';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import PageNotFound from '@/pages/PageNotFound';

/**
 * Routing skeleton.
 * Auth is still mocked; permissions are workspace-based and live in Redux for now.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* App */}
        <Route path="/" element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/inventory" element={<Navigate to="/inventory/root" replace />} />
          <Route path="/inventory/:folderId" element={<InventoryPage />} />
          <Route path="/items/:itemId" element={<ItemDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/denied" element={<AccessDeniedPage />} />
        </Route>

        {/* Convenience */}
        <Route path="/app" element={<Navigate to="/dashboard" replace />} />

        {/* 404 */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
