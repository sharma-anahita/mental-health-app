import apiClient from './apiClient';

export type RegisterData = { name: string; email: string; password: string };
export type LoginData = { email: string; password: string };

export async function register(data: RegisterData): Promise<string> {
  const res = await apiClient.post<{ token: string }>('auth/register', data);
  return res.token;
}

export async function login(data: LoginData): Promise<string> {
  const res = await apiClient.post<{ token: string }>('auth/login', data);
  return res.token;
}

export function logout(): void {
  localStorage.removeItem('token');
}

export default { register, login, logout };
