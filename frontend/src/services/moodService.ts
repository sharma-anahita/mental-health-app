import apiClient from './apiClient';
import type { MoodLog } from '../store/moodStore';

/**
 * BACKEND → FRONTEND TRANSFORMATION
 * 
 * Backend MoodLog shape:
 *   { _id, userId, mood, note, createdAt, updatedAt }
 * 
 * Frontend MoodLog shape:
 *   { id, mood, note, date }
 * 
 * Transformation rules:
 *   - _id       → id       (MongoDB ObjectId to string identifier)
 *   - createdAt → date     (timestamp field renamed for UI clarity)
 *   - userId    → stripped (not needed in frontend)
 *   - updatedAt → stripped (not needed in frontend)
 */
interface BackendMoodLog {
  _id: string;
  mood: string;
  note?: string;
  createdAt: string;
  updatedAt?: string;
  userId?: string;
}

export interface MoodLogsPageInfo {
  limit: number;
  nextCursor: string | null;
  prevCursor: string | null;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface FetchMoodLogsPageParams {
  limit?: number;
  cursor?: string;
  direction?: 'next' | 'prev';
}

export interface FetchMoodLogsPageResult {
  moods: MoodLog[];
  pageInfo: MoodLogsPageInfo;
}

/**
 * Transform backend MoodLog to frontend-friendly shape.
 * Maps _id → id, createdAt → date, strips userId and updatedAt.
 */
function transformMoodLog(raw: BackendMoodLog): MoodLog {
  return {
    id: raw._id,        // _id → id
    mood: raw.mood,
    note: raw.note,
    date: raw.createdAt, // createdAt → date
    // userId and updatedAt are stripped (not included)
  };
}

/**
 * Fetch mood logs from backend: GET /api/moods
 * Returns an array of `MoodLog`.
 */
export async function fetchMoodLogs(): Promise<MoodLog[]> {
  const data = await apiClient.get<{ moods: BackendMoodLog[] }>('moods?limit=50');
  // Expecting { moods: [...] }
  if (data && Array.isArray((data as any).moods)) {
    return (data as any).moods.map(transformMoodLog);
  }
  // Fallback: if API returns array directly
  if (Array.isArray(data)) {
    return (data as BackendMoodLog[]).map(transformMoodLog);
  }
  throw new Error('Unexpected response from /moods');
}

/**
 * Fetch mood logs with cursor-based pagination.
 */
export async function fetchMoodLogsPage(params: FetchMoodLogsPageParams = {}): Promise<FetchMoodLogsPageResult> {
  const search = new URLSearchParams();
  if (params.limit !== undefined) search.set('limit', String(params.limit));
  if (params.cursor) search.set('cursor', params.cursor);
  if (params.direction) search.set('direction', params.direction);

  const endpoint = `moods${search.toString() ? `?${search.toString()}` : ''}`;
  const data = await apiClient.get<{ moods: BackendMoodLog[]; pageInfo: MoodLogsPageInfo }>(endpoint);

  if (!data || !Array.isArray((data as any).moods) || !(data as any).pageInfo) {
    throw new Error('Unexpected paginated response from /moods');
  }

  return {
    moods: (data as any).moods.map(transformMoodLog),
    pageInfo: (data as any).pageInfo,
  };
}

/**
 * Create a new mood log via backend: POST /api/moods
 * Returns the created mood log.
 */
export async function createMoodLog(payload: Omit<MoodLog, 'id'>): Promise<MoodLog> {
  const data = await apiClient.post<{ mood: BackendMoodLog }>('moods', payload);
  if (data && (data as any).mood) {
    return transformMoodLog((data as any).mood);
  }
  // Fallback: if API returns the created resource directly with _id
  if ((data as any)._id) {
    return transformMoodLog(data as any as BackendMoodLog);
  }
  throw new Error('Unexpected response from POST /moods');
}

export default { fetchMoodLogs, fetchMoodLogsPage, createMoodLog };
