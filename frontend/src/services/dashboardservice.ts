import apiClient from './apiClient';

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  count: number; // XP gained that day (0 = no activity)
}

export interface HeatmapResponse {
  data: HeatmapDay[];
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  months: number;
}

/**
 * Fetch XP heatmap data from the backend.
 * GET /api/dashboard/heatmap?months=N
 *
 * Returns all days in the requested range. Days with no XP have count=0.
 */
export async function fetchHeatmapData(months: number = 4): Promise<HeatmapResponse> {
  const clamped = Math.max(1, Math.min(months, 24));
  return apiClient.get<HeatmapResponse>(`/dashboard/heatmap?months=${clamped}`);
}

export default { fetchHeatmapData };