import { getToken } from './tokenStorage';

/**
 * API Client with centralized error handling
 * 
 * Error types thrown:
 * - AuthError: 401 Unauthorized (token expired/invalid)
 * - ServerError: 5xx Server errors
 * - ApiError: All other non-ok responses (4xx except 401)
 */

// Read base API URL from Vite environment variable `VITE_API_BASE`.
// Local dev and production both point to the Render backend unless overridden.
const BASE_URL = (import.meta.env.VITE_API_BASE as string) ?? 'https://mental-health-app-backend-uh1q.onrender.com/api';

// ─────────────────────────────────────────────────────────────────────────────
// TYPED ERROR CLASSES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Base API error class with status code and response data.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    // Restore prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when server returns 401 Unauthorized.
 * Indicates token is missing, expired, or invalid.
 */
export class AuthError extends ApiError {
  constructor(message: string, data?: unknown) {
    super(message, 401, data);
    this.name = 'AuthError';
  }
}

/**
 * Thrown when server returns 5xx status code.
 * Indicates server-side failure.
 */
export class ServerError extends ApiError {
  constructor(message: string, status: number, data?: unknown) {
    super(message, status, data);
    this.name = 'ServerError';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST HANDLER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract error message from response data or fallback to status text.
 */
function extractErrorMessage(data: unknown, statusText: string): string {
  if (data && typeof data === 'object' && 'message' in data) {
    return String((data as { message: unknown }).message);
  }
  return statusText || 'Request failed';
}

/**
 * Create and throw the appropriate typed error based on status code.
 */
function throwTypedError(status: number, message: string, data: unknown): never {
  if (status === 401) {
    throw new AuthError(message, data);
  }
  if (status >= 500) {
    throw new ServerError(message, status, data);
  }
  throw new ApiError(message, status, data);
}

async function request<T = any>(method: string, endpoint: string, body?: any): Promise<T> {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const contentType = res.headers.get('content-type') || '';

  let data: any = null;
  if (text && contentType.includes('application/json')) {
    try {
      data = JSON.parse(text);
    } catch (err) {
      // fallback to raw text if JSON parse fails
      data = text;
    }
  } else if (text) {
    data = text;
  }

  if (!res.ok) {
    const message = extractErrorMessage(data, res.statusText);
    throwTypedError(res.status, message, data);
  }

  return data as T;
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API (unchanged surface)
// ─────────────────────────────────────────────────────────────────────────────

const apiClient = {
  get<T = any>(endpoint: string) {
    return request<T>('GET', endpoint);
  },

  post<T = any>(endpoint: string, body?: any) {
    return request<T>('POST', endpoint, body);
  },
  patch<T = any>(endpoint: string, body?: any) {
    return request<T>('PATCH', endpoint, body);
  },
  delete<T = any>(endpoint: string) {
    return request<T>('DELETE', endpoint);
  },
};

export default apiClient;
