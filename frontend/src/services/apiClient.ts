// Lightweight mock API client — easy to swap out for `fetch` or `axios` later.
// Uses Promise + setTimeout to simulate network latency and returns mock data.

import mockMoodLogs from "../data/mockMoodLogs";
import mockDashboard from "../data/mockDashboard";
import mockInsights from "../data/mockInsights";
import mockGamification from "../data/mockGamification";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export type ApiResponse<T> = {
  ok: boolean;
  status: number;
  data: T;
};

const apiClient = {
  /**
   * Simulated GET request.
   * @param endpoint simple string key for mock routing (e.g. '/mood/logs')
   */
  async get<T = any>(endpoint: string, _params?: Record<string, any>, latency = 450): Promise<ApiResponse<T>> {
    await delay(latency);

    switch (endpoint) {
      case "/mood/logs":
        return { ok: true, status: 200, data: (mockMoodLogs as unknown) as T };

      case "/dashboard":
        return { ok: true, status: 200, data: (mockDashboard as unknown) as T };

      case "/insights":
        return { ok: true, status: 200, data: (mockInsights as unknown) as T };

      case "/gamification":
        return { ok: true, status: 200, data: (mockGamification as unknown) as T };

      default:
        return { ok: true, status: 200, data: ({} as T) };
    }
  },

  /**
   * Simulated POST request. Returns created/echoed resource.
   */
  async post<T = any>(endpoint: string, body?: any, latency = 600): Promise<ApiResponse<T>> {
    await delay(latency);

    switch (endpoint) {
      case "/mood/logs": {
        const created = { id: `m-${Date.now()}`, ...(body ?? {}) };
        return { ok: true, status: 201, data: (created as unknown) as T };
      }

      default:
        return { ok: true, status: 201, data: (body as T) };
    }
  },
};

export default apiClient;
