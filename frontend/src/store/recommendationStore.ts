import { create } from 'zustand';
import recommendationService from '../services/recommendationService';
import goalService from '../services/goalService';
import type { RecommendationResponse } from '../types/recommendation';

interface RecommendationState {
  recommendations: RecommendationResponse | null;
  isLoading: boolean;
  error: string | null;

  fetchRecommendationsAsync: (refresh?: boolean) => Promise<void>;
  submitFeedbackAsync: (
    targetType: 'activity' | 'question',
    targetId: string,
    rating: 'helpful' | 'not_helpful'
  ) => Promise<void>;
  addGoalFromRecommendationAsync: (activityId: string, title: string) => Promise<void>;
}

export const useRecommendationStore = create<RecommendationState>((set, get) => ({
  recommendations: null,
  isLoading: false,
  error: null,

  fetchRecommendationsAsync: async (refresh = false) => {
    set({ isLoading: true, error: null });
    try {
      const data = await recommendationService.fetchRecommendations(refresh);
      set({ recommendations: data, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Failed to fetch recommendations', isLoading: false });
    }
  },

  submitFeedbackAsync: async (targetType, targetId, rating) => {
    const state = get();
    if (!state.recommendations) return;

    const recommendationId = state.recommendations.recommendationId;
    
    // Create deep copy backup for potential rollback
    const originalRecs = JSON.parse(JSON.stringify(state.recommendations));

    // ── Optimistic Update ──
    const updatedRecs = { ...state.recommendations };
    if (targetType === 'activity') {
      updatedRecs.activities = updatedRecs.activities.map((a) =>
        a.id === targetId ? { ...a, feedbackGiven: rating } : a
      );
    } else {
      updatedRecs.questions = updatedRecs.questions.map((q) =>
        q.id === targetId ? { ...q, feedbackGiven: rating } : q
      );
    }

    set({ recommendations: updatedRecs });

    try {
      await recommendationService.submitFeedback({
        recommendationId,
        targetType,
        targetId,
        rating
      });
    } catch (err) {
      console.error('Failed to submit feedback, rolling back:', err);
      // Roll back state to original copy
      set({ recommendations: originalRecs });
      throw err;
    }
  },

  addGoalFromRecommendationAsync: async (activityId, title) => {
    const state = get();
    if (!state.recommendations) return;

    const recommendationId = state.recommendations.recommendationId;
    
    await goalService.createFromRecommendation({
      recommendationId,
      activityId,
      title
    });
  }
}));

export default useRecommendationStore;
