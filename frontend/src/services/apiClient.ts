const BASE_URL = 'http://localhost:5000/api';

async function request<T = any>(method: string, endpoint: string, body?: any): Promise<T> {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
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
    const message = (data && data.message) || res.statusText || 'Request failed';
    const error: any = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

const apiClient = {
  get<T = any>(endpoint: string) {
    return request<T>('GET', endpoint);
  },

  post<T = any>(endpoint: string, body?: any) {
    return request<T>('POST', endpoint, body);
  },
};

export default apiClient;
