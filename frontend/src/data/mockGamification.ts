// Typed mock data for gamification features — future-backend friendly

export interface LevelProgress {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  xpPercent: number; // 0-100
}

export interface Streak {
  currentDays: number;
  longestStreak: number;
  nextMilestone: number; // days until next milestone
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  /** Icon name placeholder — backend can map to actual asset/icon */
  icon?: string;
}

export const levelProgress: LevelProgress = {
  level: 7,
  currentXP: 1420,
  nextLevelXP: 2000,
  xpPercent: Math.round((1420 / 2000) * 100),
};

export const streak: Streak = {
  currentDays: 5,
  longestStreak: 12,
  nextMilestone: 7,
};

export const achievements: Achievement[] = [
  {
    id: "ach-001",
    title: "First Entry",
    description: "Logged your first mood entry — nice start!",
    unlocked: true,
    icon: "sparkles",
  },
  {
    id: "ach-002",
    title: "5-Day Streak",
    description: "Maintained mood logging for 5 days in a row.",
    unlocked: false,
    icon: "calendar-days",
  },
  {
    id: "ach-003",
    title: "Reflector",
    description: "Saved 3 reflections — thoughtful work.",
    unlocked: true,
    icon: "feather",
  },
  {
    id: "ach-004",
    title: "Consistent Care",
    description: "Reached a 10-day streak — keep going!",
    unlocked: false,
    icon: "award",
  },
];

export default {
  levelProgress,
  streak,
  achievements,
};
