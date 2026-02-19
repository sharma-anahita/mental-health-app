/**
 * Centralized token storage utility.
 * 
 * This is the SINGLE source of truth for reading/writing the auth token.
 * All other modules should use these functions instead of accessing localStorage directly.
 */

const TOKEN_KEY = 'token';

/**
 * Get the current auth token from storage.
 * Returns null if no token exists or if running in SSR environment.
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Store the auth token.
 */
export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove the auth token from storage.
 */
export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Check if user is authenticated (has a token).
 * Note: This only checks token presence, not validity.
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

export default { getToken, setToken, removeToken, isAuthenticated };
