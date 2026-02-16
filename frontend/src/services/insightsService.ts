import apiClient from "./apiClient";
import type { InsightsMockData } from "../data/mockInsights";

/**
 * Fetch insights data (trend, distribution, insight cards).
 * Uses `apiClient` so it can be swapped for real endpoints later.
 */
export async function fetchInsightsData(): Promise<InsightsMockData> {
  const res = await apiClient.get<InsightsMockData>("/insights");
  if (!res.ok) throw new Error(`Failed to fetch insights (status=${res.status})`);
  return res.data;
}

export default { fetchInsightsData };
