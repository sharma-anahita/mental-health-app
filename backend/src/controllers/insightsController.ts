import { Request, Response, NextFunction } from 'express';
import MoodLog from '../models/MoodLog';
import * as mlService from '../services/mlService';
import {
  getCachedInsights,
  setCachedInsights,
  type InsightsCachePayload,
} from '../services/insightsCacheService';

type AuthRequest = Request & { userId?: string };

export const getInsights = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const cachedInsights = await getCachedInsights(userId);
    if (cachedInsights) {
      return res.json(cachedInsights);
    }

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

    // Transform backend shape ({ moods, ml }) into frontend shape expected by mockInsights
    // Frontend expects:
    // {
    //   trendData: [{ date: string, score: number }],
    //   distributionData: [{ moodLabel: string, count: number }],
    //   insightCards: [{ id: string, title: string, description: string, type: 'positive'|'neutral'|'warning' }]
    // }

    // Helper: map various mood representations to a numeric score (0-10-ish scale used by frontend)
    function mapMoodToScore(mood: any): number {
      if (typeof mood === 'number') return Number(mood);
      const asNum = parseFloat(String(mood));
      if (!Number.isNaN(asNum)) return asNum;
      const s = String(mood || '').toLowerCase();
      if (!s) return 5;
      if (s.includes('very') && s.includes('low')) return 1;
      if (s.includes('very low')) return 1;
      if (s.includes('low')) return 3;
      if (s.includes('neutral') || s === 'ok' || s === 'okay') return 5;
      if (s.includes('good') || s.includes('calm') || s.includes('content')) return 7;
      if (s.includes('great') || s.includes('happy') || s.includes('excellent')) return 9;
      // fallback
      return 5;
    }

    // Build trendData (oldest -> newest)
    const rawTrendLogs = logs.slice(0, 14).reverse();
    const partialTrend = rawTrendLogs.map((l: any) => {
      const date = l.createdAt ? new Date(l.createdAt).toISOString().slice(0, 10) : (l.date ? String(l.date) : new Date().toISOString().slice(0, 10));
      const score = mapMoodToScore(l.mood);
      return { date, score };
    });

    // Ensure we always return a 14-day series (frontend mock uses 14 entries)
    const DAYS = 14;
    const today = new Date();
    const lastNDates: string[] = [];
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
      d.setUTCDate(d.getUTCDate() - i);
      lastNDates.push(d.toISOString().slice(0, 10));
    }

    const trendData = lastNDates.map((dt) => {
      const found = partialTrend.find((p) => p.date === dt);
      if (found) return found;
      // fallback neutral score
      return { date: dt, score: 6 };
    });

    // Build distributionData by bucketing into the same labels used in mockInsights
    const buckets: Record<string, number> = {
      'Very low': 0,
      'Low': 0,
      'Neutral': 0,
      'Good': 0,
      'Great': 0,
    };

    for (const l of logs) {
      const score = mapMoodToScore(l.mood);
      if (score <= 2) buckets['Very low']++;
      else if (score <= 4) buckets['Low']++;
      else if (score <= 6) buckets['Neutral']++;
      else if (score <= 8) buckets['Good']++;
      else buckets['Great']++;
    }

    const distributionData = Object.keys(buckets).map((k) => ({ moodLabel: k, count: buckets[k] }));

    // Build insightCards from ml results and simple heuristics
    const insightCards: Array<{ _id?: string; id: string; title: string; description: string; type: 'positive' | 'neutral' | 'warning' }> = [];

    // ML trend insight
    if (trendResult) {
      const title = `Trend: ${trendResult.trend}`;
      const desc = `The model identifies a ${trendResult.trend} trend with ${trendResult.volatility} volatility (risk ${Number(trendResult.riskScore).toFixed(2)}). Gentle, consistent routines can help.`;
      const type: 'positive' | 'neutral' | 'warning' = trendResult.trend === 'increasing' && Number(trendResult.riskScore) < 0.5 ? 'positive' : (trendResult.trend === 'flat' ? 'neutral' : 'warning');
      insightCards.push({ _id: 'ins-trend-ml', id: 'ins-trend-ml', title, description: desc, type });
    }

    // ML sentiment insight
    if (sentimentResult) {
      const title = `Reflections: ${sentimentResult.sentimentLabel}`;
      const desc = `Recent reflections look ${sentimentResult.sentimentLabel}. Sentiment score: ${Number(sentimentResult.sentimentScore).toFixed(2)}.`;
      const type: 'positive' | 'neutral' | 'warning' = sentimentResult.sentimentLabel === 'positive' ? 'positive' : (sentimentResult.sentimentLabel === 'neutral' ? 'neutral' : 'warning');
      insightCards.push({ _id: 'ins-sentiment-ml', id: 'ins-sentiment-ml', title, description: desc, type });
    }

    // Distribution-based insight: most common bucket
    const mostCommon = distributionData.reduce((acc, cur) => (cur.count > acc.count ? cur : acc), { moodLabel: 'Neutral', count: 0 });
    if (mostCommon && mostCommon.count > 0) {
      const title = `Mostly ${mostCommon.moodLabel}`;
      const desc = `Your recent entries are mostly ${mostCommon.moodLabel.toLowerCase()}. This helps highlight typical moments to reflect on.`;
      const type: 'positive' | 'neutral' | 'warning' = mostCommon.moodLabel === 'Great' || mostCommon.moodLabel === 'Good' ? 'positive' : (mostCommon.moodLabel === 'Neutral' ? 'neutral' : 'warning');
      insightCards.push({ _id: 'ins-distribution-common', id: 'ins-distribution-common', title, description: desc, type });
    }

    // Volatility heuristic insight
    if (trendResult && trendResult.volatility === 'high') {
      insightCards.push({ _id: 'ins-volatility', id: 'ins-volatility', title: 'High variability', description: 'Mood shows higher variability recently; small grounding practices may help with stability.', type: 'warning' });
    }

    // Ensure at least one gentle insight exists
    if (insightCards.length === 0) {
      insightCards.push({ _id: 'ins-default-01', id: 'ins-default-01', title: 'Keep going', description: 'You are tracking your mood — small consistent steps support wellbeing.', type: 'neutral' });
    }

    // Preserve original shape (`moods`, `ml`) for backwards compatibility
    const response: InsightsCachePayload = {
      trendData,
      distributionData,
      insightCards,
      moods: logs,
      ml: { trend: trendResult, sentiment: sentimentResult },
    };

    void setCachedInsights(userId, response);

    return res.json(response);
  } catch (err) {
    next(err);
  }
};

export default { getInsights };
