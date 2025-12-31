import Navigation from '@/components/Navigation/Navigation';

import { paths } from '@/app/paths';
import NotificationToast from '@/components/Notification/NotificationToast';
import PageNotFound from '@/features/Errors/PageNotFound';
import AuthMiddleware from '@/middlewares/authMiddleware';
import { Grid } from '@mui/material';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <>
      <NotificationToast />
      <BrowserRouter>
        <AuthMiddleware />
        <Grid container spacing={2}>
          <Grid size={2}>
            <Navigation />
          </Grid>
          <Grid size={10}>
            <Routes>
              <Route path="/" element={<div>Home Page</div>} />
              {paths.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={<route.component />}
                />
              ))}
              {/* <Route path="/about" element={<div>About Page</div>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} /> */}
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Grid>
        </Grid>
      </BrowserRouter>
      {/* <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <BearButtons /> */}
    </>
  );
}

export default App;
