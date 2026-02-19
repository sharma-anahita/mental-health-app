import { create } from "zustand";
import * as userService from "../services/userService";

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

  fetchUserProgressAsync: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  level: 1,
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
}));

export default useUserStore;
