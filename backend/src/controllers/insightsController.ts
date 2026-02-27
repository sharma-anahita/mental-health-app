import { Request, Response, NextFunction } from 'express';
import MoodLog from '../models/MoodLog';
import * as mlService from '../services/mlService';

type AuthRequest = Request & { userId?: string };

export const getInsights = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // fetch last 7 mood logs (most recent first)
    const logs = await MoodLog.find({ userId }).sort({ createdAt: -1 }).limit(7).lean();

    // prepare mood numeric array (oldest -> newest)
    const moodsDesc = logs.map((l: any) => {
      const v = l.mood;
      const n = typeof v === 'number' ? v : parseFloat(String(v)) || 0;
      return Number(n);
    });

    const moods = moodsDesc.slice().reverse();

    // prepare text for sentiment: concatenate recent notes if present
    const notes = logs
      .map((l: any) => (l.note ? String(l.note).trim() : ''))
      .filter(Boolean)
      .slice(0, 5)
      .reverse();

    const combinedText = notes.join('. ');

    // call ML service (if we have enough data)
    let trendResult = null;
    let sentimentResult = null;

    if (moods.length >= 2) {
      try {
        trendResult = await mlService.analyzeTrend(moods);
      } catch (err) {
        console.warn('ML trend call failed', err);
        trendResult = null;
      }
    }

    if (combinedText && combinedText.length > 3) {
      try {
        sentimentResult = await mlService.analyzeReflection(combinedText);
      } catch (err) {
        console.warn('ML sentiment call failed', err);
        sentimentResult = null;
      }
    }

    res.json({ moods: logs, ml: { trend: trendResult, sentiment: sentimentResult } });
  } catch (err) {
    next(err);
  }
};

export default { getInsights };
