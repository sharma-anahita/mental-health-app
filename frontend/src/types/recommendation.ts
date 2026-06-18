export interface ScoredActivity {
  id: string;
  key: string;
  title: string;
  description: string;
  category: 'physical' | 'cognitive' | 'creative' | 'social' | 'mindfulness';
  durationMinutes: number;
  score: number;
  rank: number;
  feedbackGiven: 'helpful' | 'not_helpful' | null;
}

export interface ScoredQuestion {
  id: string;
  key: string;
  text: string;
  score: number;
  rank: number;
  feedbackGiven: 'helpful' | 'not_helpful' | null;
}

export interface RecommendationContext {
  dominantMood: string;
  energyLevel: 'low' | 'medium' | 'high';
  trend: 'declining' | 'stable' | 'improving';
  streakDays: number;
  source?: 'onboarding' | 'rule-based' | 'diversity-fallback';
}

export interface RecommendationResponse {
  recommendationId: string;
  generatedAt: string;
  expiresAt: string;
  context: RecommendationContext;
  activities: ScoredActivity[];
  questions: ScoredQuestion[];
}

export interface RecommendationFeedbackPayload {
  recommendationId: string;
  targetType: 'activity' | 'question';
  targetId: string;
  rating: 'helpful' | 'not_helpful';
}
