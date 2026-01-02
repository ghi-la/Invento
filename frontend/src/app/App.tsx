import { paths } from '@/app/paths';
import NotificationToast from '@/components/Notification/NotificationToast';
import PageNotFound from '@/features/Errors/PageNotFound';
import AppShell from '@/layouts/AppShell/AppShell';
import AuthMiddleware from '@/middlewares/authMiddleware';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <>
      <NotificationToast />
      <BrowserRouter>
        <AuthMiddleware />
        <AppShell title="Invento">
          <Routes>
            <Route path="/" element={<div>Home Page</div>} />
            {paths.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<route.component />}
              />
            ))}
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </>
  );
}

export default App;
