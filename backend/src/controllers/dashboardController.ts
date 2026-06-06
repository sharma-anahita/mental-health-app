import { Request, Response, NextFunction } from 'express';
import DailyXP from '../models/DailyXP';
import {
  getCachedHeatmap,
  setCachedHeatmap,
  invalidateHeatmapCache,
  type HeatmapCachePayload,
  type HeatmapData,
} from '../services/heatmapCacheService';

type AuthRequest = Request & { userId?: string };

const MIN_MONTHS = 1;
const MAX_MONTHS = 24;
const DEFAULT_MONTHS = 4;

export const getHeatmapData = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Parse months parameter (default 4)
    let months = DEFAULT_MONTHS;
    if (req.query.months) {
      const parsed = parseInt(String(req.query.months), 10);
      if (!isNaN(parsed)) {
        months = Math.max(MIN_MONTHS, Math.min(parsed, MAX_MONTHS));
      }
    }

    // Check cache
    const cached = await getCachedHeatmap(userId, months);
    if (cached) {
      console.log(`[HEATMAP_CACHE] HIT userId=${userId} months=${months}`);
      return res.json(cached);
    }

    console.log(`[HEATMAP_CACHE] MISS userId=${userId} months=${months}`);

    // Calculate date range: last N months from today
    const endDate = new Date();
    endDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCDate(endDate.getUTCDate() + 1); // End of today

    const startDate = new Date(endDate);
    startDate.setUTCMonth(startDate.getUTCMonth() - months);

    // Fetch all daily XP records for this user in the date range
    const dailyXPs = await DailyXP.find(
      {
        userId,
        date: {
          $gte: startDate,
          $lt: endDate,
        },
      },
      { date: 1, xpGained: 1 },
      { lean: true }
    );

    // Build a map of date -> xpGained for quick lookup
    const xpMap = new Map<string, number>();
    dailyXPs.forEach((record: any) => {
      const dateStr = record.date.toISOString().split('T')[0]; // YYYY-MM-DD
      xpMap.set(dateStr, record.xpGained);
    });

    // Generate array of all dates in range, filling missing ones with 0
    const data: HeatmapData[] = [];
    const currentDate = new Date(startDate);

    while (currentDate < endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const xpGained = xpMap.get(dateStr) ?? 0;
      data.push({ date: dateStr, count: xpGained });
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    const payload: HeatmapCachePayload = {
      data,
      startDate: startDate.toISOString().split('T')[0],
      endDate: new Date(endDate.getTime() - 1000 * 60 * 60 * 24).toISOString().split('T')[0], // Actual last day
      months,
    };

    // Cache the response
    await setCachedHeatmap(userId, months, payload);

    res.json(payload);
  } catch (err) {
    next(err);
  }
};

export default {
  getHeatmapData,
};
