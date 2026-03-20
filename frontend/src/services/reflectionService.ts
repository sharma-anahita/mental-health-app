import apiClient from './apiClient';

export interface Reflection {
  _id?: string;
  id?: string;
  userId?: string;
  text: string;
  date: string; // ISO string
  sentiment?: {
    score?: number;
    label?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Create or update a reflection for today
 * POST /api/reflections
 */
export async function createReflection(text: string): Promise<Reflection & { stats: any }> {
  const data = await apiClient.post<any>('reflections', { text });
  if (!data) throw new Error('Failed to create reflection');
  
  // Normalize response: _id → id
  const reflection = data.reflection || data;
  return {
    ...reflection,
    id: reflection._id || reflection.id,
    date: reflection.date || new Date().toISOString(),
    stats: data.stats,
  };
}

/**
 * Fetch reflection for today
 * GET /api/reflections/today
 */
export async function getReflectionToday(): Promise<Reflection | null> {
  const data = await apiClient.get<{ reflection: Reflection | null }>('reflections/today');
  if (!data || !data.reflection) return null;
  
  const reflection = data.reflection;
  return {
    ...reflection,
    id: reflection._id || reflection.id,
    date: reflection.date || new Date().toISOString(),
  };
}

/**
 * Fetch all reflections (paginated)
 * GET /api/reflections?limit=30&skip=0
 */
export async function getReflections(limit = 30, skip = 0): Promise<{ reflections: Reflection[]; total: number }> {
  const data = await apiClient.get<{ reflections: Reflection[]; total: number }>(`reflections?limit=${limit}&skip=${skip}`);
  if (!data || !Array.isArray(data.reflections)) {
    throw new Error('Failed to fetch reflections');
  }
  
  return {
    reflections: data.reflections.map(r => ({
      ...r,
      id: r._id || r.id,
      date: r.date || new Date().toISOString(),
    })),
    total: data.total || 0,
  };
}

export default { createReflection, getReflectionToday, getReflections };
