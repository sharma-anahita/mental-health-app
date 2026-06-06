import redis from '../config/redis';

export const HEATMAP_CACHE_TTL_SECONDS = 60 * 60 * 24; // 24 hours

export interface HeatmapData {
  date: string; // YYYY-MM-DD
  count: number; // XP gained on this day
}

export interface HeatmapCachePayload {
  data: HeatmapData[];
  startDate: string;
  endDate: string;
  months: number;
}

const buildHeatmapCacheKey = (userId: string, months: number): string => `heatmap:${userId}:${months}`;

export const getHeatmapCacheKey = (userId: string, months: number): string => buildHeatmapCacheKey(userId, months);

export async function getCachedHeatmap(userId: string, months: number): Promise<HeatmapCachePayload | null> {
  try {
    const raw = await redis.get<string>(buildHeatmapCacheKey(userId, months));
    if (!raw) return null;

    if (typeof raw === 'string') {
      return JSON.parse(raw) as HeatmapCachePayload;
    }

    return raw as HeatmapCachePayload;
  } catch (err) {
    console.warn('Heatmap cache read failed, serving uncached response:', err);
    return null;
  }
}

export async function setCachedHeatmap(userId: string, months: number, payload: HeatmapCachePayload): Promise<void> {
  try {
    await redis.set(buildHeatmapCacheKey(userId, months), JSON.stringify(payload), {
      ex: HEATMAP_CACHE_TTL_SECONDS,
    });
  } catch (err) {
    console.warn('Heatmap cache write failed, continuing without cache:', err);
  }
}

export async function invalidateHeatmapCache(userId: string): Promise<void> {
  try {
    // Delete all heatmap cache entries for this user (all month ranges)
    const pattern = `heatmap:${userId}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.warn('Heatmap cache invalidation failed, continuing request:', err);
  }
}
