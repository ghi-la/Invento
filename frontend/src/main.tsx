import { ThemeProvider } from '@emotion/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './app/App';
import { store } from './hooks/store';
import './index.css';
import InventoTheme from './layouts/theme';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={InventoTheme}>
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
