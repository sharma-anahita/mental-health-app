import apiClient from './apiClient';
import type { RecommendationResponse, RecommendationFeedbackPayload } from '../types/recommendation';

export async function fetchRecommendations(refresh = false): Promise<RecommendationResponse> {
  const endpoint = refresh ? 'recommendations?refresh=true' : 'recommendations';
  return apiClient.get<RecommendationResponse>(endpoint);
}

export async function submitFeedback(payload: RecommendationFeedbackPayload): Promise<{ message: string; rating: string }> {
  return apiClient.post<{ message: string; rating: string }>('recommendations/feedback', payload);
}

export default { fetchRecommendations, submitFeedback };
