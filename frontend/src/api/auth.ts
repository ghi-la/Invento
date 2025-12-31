import { api } from './client';

export type AuthUser = { id: string; username: string; email: string };
export type LoginResponse = { token: string; user: AuthUser; message?: string };

async function tryLogin(path: string, email: string, password: string): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>(path, { email, password });
  return res.data;
}

/**
 * Login against backend.
 * The provided backend template sometimes mounts routes under /auth or /users.
 * We try /auth/login first, then fallback to /users/login.
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    return await tryLogin('/auth/login', email, password);
  } catch (e: any) {
    // If route not found, try fallback
    const status = e?.response?.status;
    if (status === 404) {
      return await tryLogin('/users/login', email, password);
    }
    throw e;
  }
}

export type RegisterResponse = { token: string; user: AuthUser; message?: string };

export async function register(username: string, email: string, password: string): Promise<RegisterResponse> {
  try {
    const res = await api.post<RegisterResponse>('/auth/register', { username, email, password });
    return res.data;
  } catch (e: any) {
    const status = e?.response?.status;
    if (status === 404) {
      const res = await api.post<RegisterResponse>('/users/register', { username, email, password });
      return res.data;
    }
    throw e;
  }
}
