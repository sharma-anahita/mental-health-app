import redis from '../config/redis';

export const INSIGHTS_CACHE_TTL_SECONDS = 60 * 60 * 24;

export interface InsightsCachePayload {
  trendData: Array<{ date: string; score: number }>;
  distributionData: Array<{ moodLabel: string; count: number }>;
  insightCards: Array<{
    _id?: string;
    id: string;
    title: string;
    description: string;
    type: 'positive' | 'neutral' | 'warning';
  }>;
  moods: unknown[];
  ml: {
    trend: unknown;
    sentiment: unknown;
  };
}

const buildInsightsCacheKey = (userId: string) => `insights:${userId}`;

export const getInsightsCacheKey = (userId: string): string => buildInsightsCacheKey(userId);

export async function getCachedInsights(userId: string): Promise<InsightsCachePayload | null> {
  try {
    const raw = await redis.get<string>(buildInsightsCacheKey(userId));
    if (!raw) return null;

    if (typeof raw === 'string') {
      return JSON.parse(raw) as InsightsCachePayload;
    }

    return raw as InsightsCachePayload;
  } catch (err) {
    console.warn('Insights cache read failed, serving uncached response:', err);
    return null;
  }
}

export async function setCachedInsights(userId: string, payload: InsightsCachePayload): Promise<void> {
  try {
    await redis.set(buildInsightsCacheKey(userId), JSON.stringify(payload), {
      ex: INSIGHTS_CACHE_TTL_SECONDS,
    });
  } catch (err) {
    console.warn('Insights cache write failed, continuing without cache:', err);
  }
}

export async function invalidateInsightsCache(userId: string): Promise<void> {
  try {
    await redis.del(buildInsightsCacheKey(userId));
  } catch (err) {
    console.warn('Insights cache invalidation failed, continuing request:', err);
  }
}
