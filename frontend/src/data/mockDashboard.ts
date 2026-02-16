// Typed mock data for the dashboard UI
// Kept intentionally simple and strictly typed for easy migration to backend data models.

export interface MoodSummary {
  moodLabel: string;
  moodDescription: string;
  score: number; // 0-10 scale (float allowed)
}

export interface XP {
  level: number;
  xpPercent: number; // 0-100
  coins: number;
}

export interface Streak {
  days: number;
  lastEntry: string; // ISO date or human-friendly string
}

export interface WeeklyMoodEntry {
  date: string; // ISO date
  score: number; // 0-10
}

export interface Reflection {
  text: string;
  updatedAt: string; // ISO date
}

export interface DashboardMockData {
  moodSummary: MoodSummary;
  xp: XP;
  streak: Streak;
  weeklyMoodData: WeeklyMoodEntry[]; // exactly 7 entries expected by UI
  reflection: Reflection;
}

export const mockDashboard: DashboardMockData = {
  moodSummary: {
    moodLabel: "Calm",
    moodDescription: "Mostly peaceful day with a few small wins.",
    score: 7.8,
  },

  xp: {
    level: 12,
    xpPercent: 64, // percent complete toward next level
    coins: 320,
  },

  streak: {
    days: 5,
    lastEntry: "2026-02-14T10:30:00Z",
  },

  weeklyMoodData: [
    { date: "2026-02-10", score: 6 },
    { date: "2026-02-11", score: 7 },
    { date: "2026-02-12", score: 8 },
    { date: "2026-02-13", score: 7 },
    { date: "2026-02-14", score: 6 },
    { date: "2026-02-15", score: 8 },
    { date: "2026-02-16", score: 7 },
  ],

  reflection: {
    text: "Today I felt more relaxed after a short walk. Small wins: made time for a break and journaled briefly.",
    updatedAt: "2026-02-16T18:30:00Z",
  },
};

export default mockDashboard;
