import apiClient from "./apiClient";
import type { LevelProgress, Streak } from "../data/mockGamification";

export type UserProgress = {
  levelProgress: LevelProgress;
  streak: Streak;
};

/**
 * Fetch user progress (level/xp/streak) from the mock API client.
 * Prepared to replace with a real backend endpoint later.
 */
export async function fetchUserProgress(): Promise<UserProgress> {
  const res = await apiClient.get('/gamification');
  if (!res.ok) throw new Error(`Failed to fetch user progress (status=${res.status})`);

  // Expecting the mock gamification shape from mockGamification
  const payload = res.data as any;
  return {
    levelProgress: payload.levelProgress as LevelProgress,
    streak: payload.streak as Streak,
  };
}

export default { fetchUserProgress };
