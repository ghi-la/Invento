import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL as string | undefined;

if (!baseURL) {
  // eslint-disable-next-line no-console
  console.warn('VITE_API_BASE_URL is not set. API calls will fail until you add it to .env');
}

export const api = axios.create({
  baseURL: baseURL ?? '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Simple auth: read token from localStorage on each request.
// (Avoids store/axios circular dependencies.)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('invento_token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
