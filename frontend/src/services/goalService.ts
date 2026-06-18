import apiClient from './apiClient';

export interface GoalPayload {
  _id?: string;
  type: 'daily' | 'weekly' | 'recommended';
  text: string;
  completed?: boolean;
  completedAt?: string | null;
  sourceRecommendationId?: string;
  sourceActivityId?: string;
}

export const listGoals = async () => {
  return apiClient.get<{ goals: GoalPayload[] }>('/goals');
};

export const createGoal = async (payload: { type: 'daily' | 'weekly' | 'recommended'; text: string }) => {
  return apiClient.post<{ goal: GoalPayload }>('/goals', payload);
};

export const createFromRecommendation = async (payload: { recommendationId: string; activityId: string; title: string }) => {
  return apiClient.post<{ goal: GoalPayload; xpGained?: number; user?: any }>('/goals/from-recommendation', payload);
};

export const updateGoal = async (id: string, patch: Partial<GoalPayload>) => {
  return apiClient.patch<{ goal: GoalPayload; xpGained?: number; user?: any }>(`/goals/${id}`, patch);
};

export const deleteGoal = async (id: string) => {
  return apiClient.delete<{ message: string }>(`/goals/${id}`);
};

export default { listGoals, createGoal, createFromRecommendation, updateGoal, deleteGoal };

