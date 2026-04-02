import axios from 'axios';
import { getToken } from './tokenStorage';

const BASE_URL = (import.meta.env.VITE_API_BASE as string) ?? 'https://mental-health-app-backend-uh1q.onrender.com/api';

// Axios instance for store APIs. JWT is attached via interceptor.
const storeApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

storeApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type StoreItemType = 'theme' | 'fontColor' | 'fontStyle' | 'cosmetic' | 'utility';

export interface StoreItem {
  id: string;
  name: string;
  type: StoreItemType;
  price: number;
  itemKey: string;
  description?: string;
  owned: boolean;
}

export interface StoreUserSummary {
  coins: number;
}

export interface GetStoreItemsResponse {
  items: StoreItem[];
  ownedItemKeys: string[];
  user: StoreUserSummary;
}

export interface PurchaseResultUser {
  id: string;
  name: string;
  email: string;
  coins: number;
  inventory: unknown[];
  preferences?: {
    theme?: string;
  };
  xp?: number;
  level?: number;
  streak?: number;
}

export interface PurchaseItemResponse {
  message: string;
  purchasedItem: {
    itemKey: string;
    price: number;
  };
  user: PurchaseResultUser;
}

function normalizeApiError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.message;
    if (typeof serverMessage === 'string' && serverMessage.trim().length > 0) {
      return new Error(serverMessage);
    }
    return new Error(error.message || 'Request failed');
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('Unexpected error');
}

export async function getStoreItems(): Promise<GetStoreItemsResponse> {
  try {
    const { data } = await storeApi.get<GetStoreItemsResponse>('/store');
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function purchaseItem(itemKey: string): Promise<PurchaseItemResponse> {
  try {
    const { data } = await storeApi.post<PurchaseItemResponse>('/store/purchase', { itemKey });
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export default {
  getStoreItems,
  purchaseItem,
};
