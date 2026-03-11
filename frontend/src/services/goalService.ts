import apiClient from './apiClient';

export interface GoalPayload {
  _id?: string;
  type: 'daily' | 'weekly';
  text: string;
  completed?: boolean;
  completedAt?: string | null;
}

export const listGoals = async () => {
  return apiClient.get<{ goals: GoalPayload[] }>('/goals');
};

export const createGoal = async (payload: { type: 'daily' | 'weekly'; text: string }) => {
  return apiClient.post<{ goal: GoalPayload }>('/goals', payload);
};

export const updateGoal = async (id: string, patch: Partial<GoalPayload>) => {
  return apiClient.patch<{ goal: GoalPayload; xpGained?: number; user?: any }>(`/goals/${id}`, patch);
};

export const deleteGoal = async (id: string) => {
  return apiClient.delete<{ message: string }>(`/goals/${id}`);
};

export default { listGoals, createGoal, updateGoal, deleteGoal };
