import apiClient from './apiClient';
import { setToken, removeToken } from './tokenStorage';
import { useMoodStore } from '../store/moodStore';
import { useUserStore } from '../store/userStore';
import { useUIStore } from '../store/uiStore';

export type RegisterData = { name: string; email: string; password: string };
export type LoginData = { email: string; password: string };

/**
 * Register a new user and store the token.
 */
export async function register(data: RegisterData): Promise<string> {
  const res = await apiClient.post<{ token: string }>('auth/register', data);
  if (res.token) {
    setToken(res.token);
  }
  return res.token;
}

/**
 * Login and store the token.
 */
export async function login(data: LoginData): Promise<string> {
  const res = await apiClient.post<{ token: string }>('auth/login', data);
  if (res.token) {
    setToken(res.token);
  }
  return res.token;
}

/**
 * Logout: remove token and reset all Zustand stores.
 */
export function logout(): void {
  // Remove token from storage
  removeToken();
  
  // Reset all Zustand stores to clear user data
  useMoodStore.getState().reset();
  useUserStore.getState().reset();
  useUIStore.getState().reset();
}

export default { register, login, logout };
