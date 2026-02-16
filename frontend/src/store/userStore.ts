import create from "zustand";

/**
 * Frontend-only user progress cache (Zustand)
 * - Minimal logic, ready for backend syncing later
 */

export interface UserProgress {
  level: number;
  xp: number;
  streak: number;
  coins: number;
}

interface UserState extends UserProgress {
  setUserProgress: (p: Partial<UserProgress>) => void;
  incrementXP: (amount?: number) => void;
  incrementStreak: (by?: number) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  level: 1,
  xp: 0,
  streak: 0,
  coins: 0,

  setUserProgress: (p) =>
    set((s) => ({
      level: p.level ?? s.level,
      xp: p.xp ?? s.xp,
      streak: p.streak ?? s.streak,
      coins: p.coins ?? s.coins,
    })),

  incrementXP: (amount = 1) =>
    set((s) => ({ xp: s.xp + amount })),

  incrementStreak: (by = 1) =>
    set((s) => ({ streak: s.streak + by })),
}));

export default useUserStore;
