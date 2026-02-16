// Typed mock data for insights: trend, distribution, and insight cards

export interface TrendEntry {
  date: string; // ISO date
  score: number; // 0-10
}

export interface DistributionEntry {
  moodLabel: string;
  count: number;
}

export type InsightType = "positive" | "neutral" | "warning";

export interface InsightCard {
  id: string;
  title: string;
  description: string;
  type: InsightType;
}

export interface InsightsMockData {
  trendData: TrendEntry[]; // last 14 days
  distributionData: DistributionEntry[];
  insightCards: InsightCard[];
}

export const mockInsights: InsightsMockData = {
  trendData: [
    { date: "2026-02-03", score: 6 },
    { date: "2026-02-04", score: 6.5 },
    { date: "2026-02-05", score: 7 },
    { date: "2026-02-06", score: 6.8 },
    { date: "2026-02-07", score: 6.9 },
    { date: "2026-02-08", score: 7.2 },
    { date: "2026-02-09", score: 7.0 },
    { date: "2026-02-10", score: 6.0 },
    { date: "2026-02-11", score: 6.8 },
    { date: "2026-02-12", score: 7.4 },
    { date: "2026-02-13", score: 6.6 },
    { date: "2026-02-14", score: 7.5 },
    { date: "2026-02-15", score: 6.9 },
    { date: "2026-02-16", score: 7.1 },
  ],

  distributionData: [
    { moodLabel: "Very low", count: 1 },
    { moodLabel: "Low", count: 3 },
    { moodLabel: "Neutral", count: 4 },
    { moodLabel: "Good", count: 4 },
    { moodLabel: "Great", count: 2 },
  ],

  insightCards: [
    {
      id: "ins-01",
      title: "Steady mid-week improvements",
      description: "Your mood tends to improve around mid-week; consider small activities that support this pattern.",
      type: "positive",
    },
    {
      id: "ins-02",
      title: "Frequent low mornings",
      description: "There are a few recent mornings with lower mood scores. Gentle routines (light, hydration, brief movement) may help.",
      type: "neutral",
    },
    {
      id: "ins-03",
      title: "Weekend variability",
      description: "Mood shows more variation on weekend days; keeping a simple plan can provide structure during those days.",
      type: "warning",
    },
  ],
};

export default mockInsights;
