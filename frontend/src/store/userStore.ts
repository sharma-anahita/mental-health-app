import { create } from "zustand";
import * as userService from "../services/userService";
import type { User } from "../types/user";

/**
 * Frontend-only user progress cache (Zustand)
 * - Minimal logic, ready for backend syncing later
 */

export interface UserProgress {
  level: number;
  xp: number;
  xpPercent?: number;
  streak: number;
  coins: number;
}

interface UserState extends UserProgress {
  isLoading: boolean;
  error: string | null;

  setUserProgress: (p: Partial<UserProgress>) => void;
  incrementXP: (amount?: number) => void;
  incrementStreak: (by?: number) => void;
  applyProfileUpdate: (u: Partial<User>) => void;
  reset: () => void;

  fetchUserProgressAsync: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  level: 0,
  xp: 0,
  xpPercent: 0,
  streak: 0,
  coins: 0,

  isLoading: false,
  error: null,

  setUserProgress: (p) =>
    set((s) => ({
      level: p.level ?? s.level,
      xp: p.xp ?? s.xp,
      xpPercent: p.xpPercent ?? s.xpPercent,
      streak: p.streak ?? s.streak,
      coins: p.coins ?? s.coins,
    })),

  incrementXP: (amount = 1) =>
    set((s) => ({ xp: s.xp + amount })),

  incrementStreak: (by = 1) =>
    set((s) => ({ streak: s.streak + by })),

  // Reset store to initial state (used on logout)
  reset: () => set(() => ({
    level: 0,
    xp: 0,
    xpPercent: 0,
    streak: 0,
    coins: 0,
    isLoading: false,
    error: null,
  })),

  fetchUserProgressAsync: async () => {
    set(() => ({ isLoading: true, error: null }));
    try {
      const progress = await userService.fetchUserProgress();
      set(() => ({
        level: progress.levelProgress.level,
        xp: progress.levelProgress.currentXP,
        xpPercent: progress.levelProgress.xpPercent ?? 0,
        streak: progress.streak.currentDays,
        coins: progress.coins ?? 0,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set(() => ({ error: message, isLoading: false }));
    }
  },
  applyProfileUpdate: (u: Partial<User>) =>
    set((s) => {
      const newLevel = u.level ?? s.level;
      const newXp = u.xp ?? s.xp;

      // calculate xpPercent toward next level if we have xp/level
      let newXpPercent = s.xpPercent;
      if (newXp !== undefined && newLevel !== undefined) {
        const minXpForLevel = 100 * Math.pow(newLevel, 2);
        const nextLevel = newLevel + 1;
        const nextLevelXp = 100 * Math.pow(nextLevel, 2);
        const denom = nextLevelXp - minXpForLevel;
        const frac = denom > 0 ? (newXp - minXpForLevel) / denom : 0;
        newXpPercent = Math.max(0, Math.min(100, Math.round(frac * 100)));
      }

      return {
        level: newLevel,
        xp: newXp,
        xpPercent: newXpPercent,
        streak: u.streak ?? s.streak,
        coins: u.coins ?? s.coins,
      };
    }),
}));

export default useUserStore;
