import apiClient from "./apiClient";
import type { LevelProgress, Streak } from "../data/mockGamification";

/**
 * BACKEND → FRONTEND TRANSFORMATION
 * 
 * Backend gamification response shape:
 *   {
 *     levelProgress: { level, currentXP, xpPercent },
 *     streak: { currentDays, lastEntry },
 *     coins
 *   }
 * 
 * Frontend UserProgress shape:
 *   {
 *     levelProgress: { level, currentXP, nextLevelXP, xpPercent },
 *     streak: { currentDays, longestStreak, nextMilestone },
 *     coins
 *   }
 * 
 * Transformation rules:
 *   - levelProgress.nextLevelXP → defaults to 0 if not provided (backend doesn't send it)
 *   - streak.longestStreak      → defaults to currentDays if not provided
 *   - streak.nextMilestone      → defaults to 7 if not provided
 *   - coins                     → defaults to 0 if not provided
 */

/** Backend response shape for gamification endpoint */
interface BackendGamificationResponse {
  levelProgress: {
    level: number;
    currentXP: number;
    xpPercent?: number;
  };
  streak: {
    currentDays: number;
    lastEntry?: string | null;
    broken?: boolean;
    previousValue?: number;
    canRestore?: boolean;
  };
  coins?: number;
  restoreTickets?: number;
}

export type UserProgress = {
  levelProgress: LevelProgress;
  streak: Streak;
  coins: number;
  streakRestore: {
    broken: boolean;
    previousValue: number;
    canRestore: boolean;
    tickets: number;
  };
};

/**
 * Transform backend gamification response to frontend-friendly shape.
 * Fills in missing optional fields with sensible defaults.
 */
function transformGamificationResponse(raw: BackendGamificationResponse): UserProgress {
  return {
    levelProgress: {
      level: raw.levelProgress.level,
      currentXP: raw.levelProgress.currentXP,
      nextLevelXP: 0, // Backend doesn't provide this; UI can calculate or ignore
      // backend provides xpPercent as fraction (0-1) — convert to percentage (0-100)
      xpPercent: Math.round((raw.levelProgress.xpPercent ?? 0) * 100),
    },
    streak: {
      currentDays: raw.streak.currentDays,
      longestStreak: raw.streak.currentDays, // Backend doesn't track; default to current
      nextMilestone: 7, // Default milestone target
      // lastEntry is stripped (not needed in frontend Streak type)
    },
    coins: raw.coins ?? 0,
    streakRestore: {
      broken: raw.streak.broken ?? false,
      previousValue: raw.streak.previousValue ?? 0,
      canRestore: raw.streak.canRestore ?? false,
      tickets: raw.restoreTickets ?? 0,
    },
  };
}

/**
 * Fetch user progress (level/xp/streak/coins) from the backend.
 * GET /api/gamification
 */
export async function fetchUserProgress(): Promise<UserProgress> {
  const payload = await apiClient.get<BackendGamificationResponse>('gamification');
  return transformGamificationResponse(payload);
}

export async function restoreStreak(): Promise<{ streak: number; restoreTickets: number }> {
  const payload = await apiClient.post<{ streak: number; restoreTickets: number }>('gamification/streak/restore');
  return payload;
}

export default { fetchUserProgress, restoreStreak };
