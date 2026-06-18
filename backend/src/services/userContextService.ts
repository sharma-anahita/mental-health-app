import mongoose from 'mongoose';
import User from '../models/User';
import MoodLog from '../models/MoodLog';
import RecommendationFeedback from '../models/RecommendationFeedback';

export interface UserContext {
  dominantMood: string;
  energyLevel: 'low' | 'medium' | 'high';
  trend: 'declining' | 'stable' | 'improving';
  consecutiveLowDays: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  streakDays: number;
  recentFeedback: Record<string, 'helpful' | 'not_helpful'>;
}

/**
 * Maps mood strings (or numbers) to a standard score scale of 1-9.
 * Identical to mapMoodToScore in insightsController.ts for alignment.
 */
export function mapMoodToScore(mood: any): number {
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
  return 5;
}

/**
 * Helper to compute the dominant mood from logs within the last 7 days.
 */
export function calculateDominantMood(logs: any[]): string {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentLogs = logs.filter(
    (l) => l.createdAt && new Date(l.createdAt) >= sevenDaysAgo
  );

  const targetSet = recentLogs.length > 0 ? recentLogs : logs;
  if (targetSet.length === 0) return 'Neutral';

  const counts: Record<string, number> = {};
  for (const log of targetSet) {
    const m = log.mood || 'Neutral';
    counts[m] = (counts[m] || 0) + 1;
  }

  // Find mood with maximum count
  let dominant = 'Neutral';
  let maxCount = -1;
  for (const mood of Object.keys(counts)) {
    if (counts[mood] > maxCount) {
      maxCount = counts[mood];
      dominant = mood;
    }
  }
  return dominant;
}

/**
 * Helper to compute the energy level (low, medium, high) based on average.
 */
export function calculateEnergyLevel(logs: any[]): 'low' | 'medium' | 'high' {
  const logsWithEnergy = logs.filter((l) => typeof l.energy === 'number');
  if (logsWithEnergy.length === 0) return 'medium';

  const sum = logsWithEnergy.reduce((acc, curr) => acc + (curr.energy as number), 0);
  const avg = sum / logsWithEnergy.length;

  if (avg < 35) return 'low';
  if (avg > 65) return 'high';
  return 'medium';
}

/**
 * Helper to compute the linear slope of the last 7 mood scores.
 * y = m * x + c, solving for slope m.
 * slope < -0.2 -> 'declining', slope > 0.2 -> 'improving', else -> 'stable'
 */
export function calculateMoodTrend(logs: any[]): 'declining' | 'stable' | 'improving' {
  // Take the last 7 logs and reverse to represent chronological order (oldest to newest)
  const trendLogs = logs.slice(0, 7).reverse();
  const N = trendLogs.length;
  if (N < 2) return 'stable';

  const yValues = trendLogs.map((l) => mapMoodToScore(l.mood));
  const xValues = Array.from({ length: N }, (_, i) => i);

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < N; i++) {
    sumX += xValues[i];
    sumY += yValues[i];
    sumXY += xValues[i] * yValues[i];
    sumXX += xValues[i] * xValues[i];
  }

  const denominator = N * sumXX - sumX * sumX;
  if (denominator === 0) return 'stable';

  const slope = (N * sumXY - sumX * sumY) / denominator;

  if (slope < -0.2) return 'declining';
  if (slope > 0.2) return 'improving';
  return 'stable';
}

/**
 * Helper to count consecutive days where score < 4.
 * Uses calendar days based on UTC dates of logs to compute runs.
 */
export function calculateConsecutiveLowDays(logs: any[]): number {
  if (logs.length === 0) return 0;

  // Convert logs to day scores, grouped by UTC date string YYYY-MM-DD
  const dailyScores: Record<string, number[]> = {};
  for (const log of logs) {
    if (!log.createdAt) continue;
    const dateStr = new Date(log.createdAt).toISOString().slice(0, 10);
    const score = mapMoodToScore(log.mood);
    if (!dailyScores[dateStr]) dailyScores[dateStr] = [];
    dailyScores[dateStr].push(score);
  }

  // Calculate average score per day
  const daysSorted = Object.keys(dailyScores).sort((a, b) => b.localeCompare(a)); // Descending order (newest first)
  if (daysSorted.length === 0) return 0;

  let consecutiveLow = 0;
  const oneDayMs = 24 * 60 * 60 * 1000;

  // Start checking from the most recent logged date
  let lastCheckedDate = new Date(daysSorted[0]);
  
  for (let i = 0; i < daysSorted.length; i++) {
    const currentDateStr = daysSorted[i];
    const currentDate = new Date(currentDateStr);

    // Verify if it is consecutive (gap should be <= 1 day, allowing for consecutive sequence checks)
    const diffDays = Math.round(Math.abs(lastCheckedDate.getTime() - currentDate.getTime()) / oneDayMs);
    if (diffDays > 1) {
      break; // Gap detected in tracking
    }

    const dayScores = dailyScores[currentDateStr];
    const avgScore = dayScores.reduce((a, b) => a + b, 0) / dayScores.length;

    if (avgScore < 4) {
      consecutiveLow++;
      lastCheckedDate = currentDate;
    } else {
      break; // Streak broken by non-low day
    }
  }

  return consecutiveLow;
}

/**
 * Derives time of day context from UTC hour.
 */
export function deriveTimeOfDay(utcHour: number): 'morning' | 'afternoon' | 'evening' {
  if (utcHour >= 5 && utcHour < 12) return 'morning';
  if (utcHour >= 12 && utcHour < 18) return 'afternoon';
  return 'evening';
}

/**
 * Main service method to aggregate user logs and construct UserContext.
 */
export const getUserContext = async (userId: mongoose.Types.ObjectId): Promise<UserContext> => {
  // Fetch last 30 mood logs sorted by newest first
  const logs = await MoodLog.find({ userId })
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();

  // Fetch user streak from the database
  const user = await User.findById(userId).select('streak').lean();
  const streakDays = user?.streak ?? 0;

  // Fetch recent feedback (last 14 days)
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const feedbacks = await RecommendationFeedback.find({
    userId,
    createdAt: { $gte: fourteenDaysAgo }
  })
    .sort({ createdAt: -1 }) // newest first
    .lean();

  // Construct feedback lookup mapping (most recent rating takes precedence)
  const recentFeedback: Record<string, 'helpful' | 'not_helpful'> = {};
  for (const fb of feedbacks) {
    if (fb.targetKey && !recentFeedback[fb.targetKey]) {
      recentFeedback[fb.targetKey] = fb.rating;
    }
  }

  const utcHour = new Date().getUTCHours();

  return {
    dominantMood: calculateDominantMood(logs),
    energyLevel: calculateEnergyLevel(logs),
    trend: calculateMoodTrend(logs),
    consecutiveLowDays: calculateConsecutiveLowDays(logs),
    timeOfDay: deriveTimeOfDay(utcHour),
    streakDays,
    recentFeedback
  };
};

export default {
  getUserContext,
  mapMoodToScore,
  calculateDominantMood,
  calculateEnergyLevel,
  calculateMoodTrend,
  calculateConsecutiveLowDays,
  deriveTimeOfDay
};
