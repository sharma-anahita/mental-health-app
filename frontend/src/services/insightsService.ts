import apiClient from "./apiClient";
import type { InsightsMockData, TrendEntry, DistributionEntry, InsightCard } from "../data/mockInsights";
import { mockInsights } from "../data/mockInsights";

/**
 * BACKEND → FRONTEND TRANSFORMATION
 * 
 * Backend insights response shape (when implemented):
 *   {
 *     trendData: [{ _id?, date, score, createdAt? }],
 *     distributionData: [{ _id?, moodLabel, count }],
 *     insightCards: [{ _id, title, description, type, createdAt? }]
 *   }
 * 
 * Frontend InsightsMockData shape:
 *   {
 *     trendData: [{ date, score }],
 *     distributionData: [{ moodLabel, count }],
 *     insightCards: [{ id, title, description, type }]
 *   }
 * 
 * Transformation rules:
 *   - insightCards._id → id (MongoDB ObjectId to string identifier)
 *   - Strip _id from trendData and distributionData entries
 *   - Strip createdAt/updatedAt from all entries
 */

/** Backend shapes (for when backend is implemented) */
interface BackendTrendEntry {
  _id?: string;
  date: string;
  score: number;
  createdAt?: string;
}

interface BackendDistributionEntry {
  _id?: string;
  moodLabel: string;
  count: number;
}

interface BackendInsightCard {
  _id: string;
  title: string;
  description: string;
  type: "positive" | "neutral" | "warning";
  createdAt?: string;
  updatedAt?: string;
}

interface BackendInsightsResponse {
  trendData: BackendTrendEntry[];
  distributionData: BackendDistributionEntry[];
  insightCards: BackendInsightCard[];
}

/**
 * Transform backend trend entry to frontend shape.
 * Strips _id and createdAt.
 */
function transformTrendEntry(raw: BackendTrendEntry): TrendEntry {
  return {
    date: raw.date,
    score: raw.score,
    // _id and createdAt are stripped
  };
}

/**
 * Transform backend distribution entry to frontend shape.
 * Strips _id.
 */
function transformDistributionEntry(raw: BackendDistributionEntry): DistributionEntry {
  return {
    moodLabel: raw.moodLabel,
    count: raw.count,
    // _id is stripped
  };
}

/**
 * Transform backend insight card to frontend shape.
 * Maps _id → id, strips createdAt and updatedAt.
 */
function transformInsightCard(raw: BackendInsightCard): InsightCard {
  return {
    id: raw._id,           // _id → id
    title: raw.title,
    description: raw.description,
    type: raw.type,
    // createdAt and updatedAt are stripped
  };
}

/**
 * Transform full backend insights response to frontend shape.
 */
function transformInsightsResponse(raw: BackendInsightsResponse): InsightsMockData {
  return {
    trendData: raw.trendData.map(transformTrendEntry),
    distributionData: raw.distributionData.map(transformDistributionEntry),
    insightCards: raw.insightCards.map(transformInsightCard),
  };
}

/**
 * Fetch insights data (trend, distribution, insight cards).
 * GET /api/insights
 * 
 * NOTE: Backend endpoint not yet implemented.
 * Falls back to mock data if request fails.
 */
export async function fetchInsightsData(): Promise<InsightsMockData> {
  try {
    const data = await apiClient.get<BackendInsightsResponse>('insights');
    return transformInsightsResponse(data);
  } catch (err) {
    // Backend endpoint not implemented yet; return mock data as fallback
    console.warn('Insights endpoint not available, using mock data:', err);
    return mockInsights;
  }
}

export default { fetchInsightsData };
