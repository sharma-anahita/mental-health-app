import { Request, Response } from 'express';
import { getInsightsCacheStats } from '../services/insightsCacheMetrics';

export const getCacheStats = (req: Request, res: Response) => {
  return res.json(getInsightsCacheStats());
};

export default { getCacheStats };
