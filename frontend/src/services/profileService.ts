import apiClient from './apiClient';
import type User from '../types/user';

/**
 * Update user profile.
 * Sends PATCH /api/user/profile with partial data and returns the updated user object.
 * Throws an Error with a friendly message on failure.
 */
export async function updateProfile(data: Partial<User>): Promise<{ user: User; xpGained?: number }> {
  try {
    const res = await apiClient.patch<{ user: User; xpGained?: number }>('/user/profile', data);
    return { user: res.user, xpGained: res.xpGained };
  } catch (err: any) {
    const message = err instanceof Error ? err.message : 'Failed to update profile';
    throw new Error(`Profile update failed: ${message}`);
  }
}

export async function getProfile(): Promise<User> {
  try {
    const res = await apiClient.get<{ user: User }>('/user/profile');
    return res.user;
  } catch (err: any) {
    const message = err instanceof Error ? err.message : 'Failed to load profile';
    throw new Error(`Profile load failed: ${message}`);
  }
}

export default { updateProfile, getProfile };
