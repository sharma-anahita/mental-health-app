import apiClient from './apiClient';
import { setToken, removeToken } from './tokenStorage';
import { useMoodStore } from '../store/moodStore';
import { useUserStore } from '../store/userStore';
import { useUIStore } from '../store/uiStore';

export type RegisterData = { name: string; email: string; password: string };
export type LoginData = { email: string; password: string };
export type ResetPasswordData = { token: string; newPassword: string };
export type ForgotPasswordData = { email: string };

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
 * Login with Google ID token and store the JWT.
 */
export async function googleLogin(idToken: string): Promise<string> {
  const res = await apiClient.post<{ token: string }>('auth/google', { idToken });
  if (res.token) {
    setToken(res.token);
  }
  return res.token;
}

/**
 * Reset password using a reset token from URL params.
 */
export async function resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(`auth/reset-password/${encodeURIComponent(data.token)}`, {
    newPassword: data.newPassword,
  });
}

/**
 * Request a password reset email.
 */
export async function forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>('auth/forgot-password', data);
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

export default { register, login, googleLogin, forgotPassword, resetPassword, logout };
