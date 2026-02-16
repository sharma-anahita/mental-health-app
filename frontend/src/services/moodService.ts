import apiClient from "./apiClient";
import type { MoodLog } from "../store/moodStore";

/**
 * Fetch mood logs (mocked via apiClient).
 * Returns an array of `MoodLog`.
 */
export async function fetchMoodLogs(): Promise<MoodLog[]> {
  const res = await apiClient.get<MoodLog[]>('/mood/logs');
  if (res.ok) return res.data;
  // Keep errors simple for now — caller can handle exceptions.
  throw new Error(`Failed to fetch mood logs (status=${res.status})`);
}

/**
 * Create a new mood log. Accepts a payload without `id` and returns the created `MoodLog`.
 * Uses the mock POST route in `apiClient` which simulates latency and returns created resource.
 */
export async function createMoodLog(payload: Omit<MoodLog, 'id'>): Promise<MoodLog> {
  const res = await apiClient.post<MoodLog>('/mood/logs', payload);
  if (res.ok) return res.data;
  throw new Error(`Failed to create mood log (status=${res.status})`);
}

export default { fetchMoodLogs, createMoodLog };
