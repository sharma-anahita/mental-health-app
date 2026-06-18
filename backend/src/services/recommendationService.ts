import mongoose from 'mongoose';
import redis from '../config/redis';
import Activity from '../models/Activity';
import ReflectionQuestion from '../models/ReflectionQuestion';
import Recommendation from '../models/Recommendation';
import userContextService from './userContextService';
import scoringEngine from './scoringEngine';

export interface RecommendationResponse {
  recommendationId: string;
  generatedAt: string;
  expiresAt: string;
  context: {
    dominantMood: string;
    energyLevel: 'low' | 'medium' | 'high';
    trend: 'declining' | 'stable' | 'improving';
    streakDays: number;
    source?: 'onboarding' | 'rule-based' | 'diversity-fallback';
  };
  activities: Array<{
    id: string;
    key: string;
    title: string;
    description: string;
    category: string;
    durationMinutes: number;
    score: number;
    rank: number;
    feedbackGiven: 'helpful' | 'not_helpful' | null;
  }>;
  questions: Array<{
    id: string;
    key: string;
    text: string;
    score: number;
    rank: number;
    feedbackGiven: 'helpful' | 'not_helpful' | null;
  }>;
}

const REDIS_CACHE_TTL = 4 * 60 * 60; // 4 hours in seconds

/**
 * Checks Redis cache for existing user recommendation.
 */
export const getCachedRecommendations = async (userId: string): Promise<RecommendationResponse | null> => {
  try {
    const cacheKey = `recommendations:${userId}`;
    const cachedRaw = await redis.get(cacheKey);
    if (!cachedRaw) return null;

    if (typeof cachedRaw === 'string') {
      return JSON.parse(cachedRaw) as RecommendationResponse;
    }
    return cachedRaw as RecommendationResponse;
  } catch (err) {
    console.warn('Redis cache read failed, serving fresh recommendations:', err);
    return null;
  }
};

/**
 * Writes computed recommendation to Redis cache.
 */
export const setCachedRecommendations = async (userId: string, payload: RecommendationResponse): Promise<void> => {
  try {
    const cacheKey = `recommendations:${userId}`;
    await redis.set(cacheKey, JSON.stringify(payload), {
      ex: REDIS_CACHE_TTL
    });
  } catch (err) {
    console.warn('Redis cache write failed:', err);
  }
};

/**
 * Invalidates Redis cache for a user.
 */
export const invalidateRecommendationCache = async (userId: string): Promise<void> => {
  try {
    const cacheKey = `recommendations:${userId}`;
    await redis.del(cacheKey);
  } catch (err) {
    console.warn('Redis cache delete failed:', err);
  }
};

/**
 * Helper to fetch onboarding recommendations when user has no logs.
 */
async function getOnboardingFallback(
  userId: mongoose.Types.ObjectId,
  context: any
): Promise<RecommendationResponse> {
  // Fetch onboarding activities (gentle, standard ones)
  const onboardingActivities = await Activity.find({
    key: { $in: ['5-min-breathing', '10-min-walk', 'doodle-5-min'] },
    active: true
  }).lean();

  // Fetch onboarding questions
  const onboardingQuestions = await ReflectionQuestion.find({
    key: { $in: ['self-care-question', 'mood-lift-question'] },
    active: true
  }).lean();

  // Set default scores and ranks
  const activities = onboardingActivities.map((act: any, idx) => ({
    id: String(act._id),
    key: act.key,
    title: act.title,
    description: act.description,
    category: act.category,
    durationMinutes: act.durationMinutes,
    score: 80 - idx * 10,
    rank: idx + 1,
    feedbackGiven: null as any
  }));

  const questions = onboardingQuestions.map((q: any, idx) => ({
    id: String(q._id),
    key: q.key,
    text: q.text,
    score: 80 - idx * 10,
    rank: idx + 1,
    feedbackGiven: null as any
  }));

  const generatedAt = new Date();
  const expiresAt = new Date(generatedAt.getTime() + 4 * 60 * 60 * 1000);

  // Save Recommendation snapshot to DB
  const recDoc = await Recommendation.create({
    userId,
    activities: activities.map((a) => ({ activityId: a.id, score: a.score, rank: a.rank })),
    questions: questions.map((q) => ({ questionId: q.id, score: q.score, rank: q.rank })),
    contextSnapshot: {
      dominantMood: context.dominantMood,
      energyLevel: context.energyLevel,
      trend: context.trend,
      consecutiveLowDays: context.consecutiveLowDays,
      streakDays: context.streakDays
    },
    generatedAt,
    expiresAt
  });

  return {
    recommendationId: String(recDoc._id),
    generatedAt: generatedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    context: {
      dominantMood: context.dominantMood,
      energyLevel: context.energyLevel,
      trend: context.trend,
      streakDays: context.streakDays,
      source: 'onboarding'
    },
    activities,
    questions
  };
}

/**
 * Core orchestrator method: generates, saves, and returns user recommendations.
 */
export const getRecommendations = async (
  userIdStr: string,
  forceRefresh = false
): Promise<RecommendationResponse> => {
  const userId = new mongoose.Types.ObjectId(userIdStr);

  // 1. Check Redis Cache first (unless forceRefresh is true)
  if (!forceRefresh) {
    const cached = await getCachedRecommendations(userIdStr);
    if (cached) return cached;
  }

  // 2. Fetch UserContext metrics
  const context = await userContextService.getUserContext(userId);

  // Check if user has no logs (onboarding fallback check)
  const moodLogCount = await mongoose.model('MoodLog').countDocuments({ userId });
  if (moodLogCount === 0) {
    const onboardingRes = await getOnboardingFallback(userId, context);
    await setCachedRecommendations(userIdStr, onboardingRes);
    return onboardingRes;
  }

  // 3. Fetch all active items from DB
  const activities = await Activity.find({ active: true }).lean();
  const questions = await ReflectionQuestion.find({ active: true }).lean();

  // 4. Score all items
  const { scoredActivities, scoredQuestions } = scoringEngine.score(context, activities, questions);

  // 5. Fallback logic: check if all scores are 0 (prevents blank recommendations)
  const allActivitiesZero = scoredActivities.every((act) => act.score === 0);
  let finalActivities = scoredActivities.slice(0, 5); // Return top 5
  let sourceTag: 'rule-based' | 'diversity-fallback' = 'rule-based';

  if (allActivitiesZero && scoredActivities.length > 0) {
    // Select top 3 by category diversity (one physical, one cognitive, one mindfulness)
    const physical = scoredActivities.find((a) => a.category === 'physical');
    const cognitive = scoredActivities.find((a) => a.category === 'cognitive');
    const mindfulness = scoredActivities.find((a) => a.category === 'mindfulness');
    
    const fallbackList = [physical, cognitive, mindfulness].filter(Boolean) as typeof scoredActivities;
    
    // Fallback if we don't have all categories
    if (fallbackList.length < 3) {
      const remaining = scoredActivities.filter((a) => !fallbackList.includes(a));
      fallbackList.push(...remaining.slice(0, 3 - fallbackList.length));
    }

    finalActivities = fallbackList.map((act, idx) => ({
      ...act,
      score: 50 - idx * 10,
      rank: idx + 1
    }));
    sourceTag = 'diversity-fallback';
  }

  // Return top 3 questions
  let finalQuestions = scoredQuestions.slice(0, 3);
  if (scoredQuestions.every((q) => q.score === 0) && scoredQuestions.length > 0) {
    finalQuestions = scoredQuestions.slice(0, 3).map((q, idx) => ({
      ...q,
      score: 50 - idx * 10,
      rank: idx + 1
    }));
  }

  // 6. Map feedback states for active cards
  const activitiesPayload = finalActivities.map((act) => ({
    ...act,
    id: act.activityId,
    feedbackGiven: context.recentFeedback[act.key] || null
  }));

  const questionsPayload = finalQuestions.map((q) => ({
    ...q,
    id: q.questionId,
    feedbackGiven: context.recentFeedback[q.key] || null
  }));

  const generatedAt = new Date();
  const expiresAt = new Date(generatedAt.getTime() + 4 * 60 * 60 * 1000);

  // 7. Save Recommendation snapshot to DB
  const recDoc = await Recommendation.create({
    userId,
    activities: activitiesPayload.map((a) => ({ activityId: a.id, score: a.score, rank: a.rank })),
    questions: questionsPayload.map((q) => ({ questionId: q.id, score: q.score, rank: q.rank })),
    contextSnapshot: {
      dominantMood: context.dominantMood,
      energyLevel: context.energyLevel,
      trend: context.trend,
      consecutiveLowDays: context.consecutiveLowDays,
      streakDays: context.streakDays
    },
    generatedAt,
    expiresAt
  });

  const payload: RecommendationResponse = {
    recommendationId: String(recDoc._id),
    generatedAt: generatedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    context: {
      dominantMood: context.dominantMood,
      energyLevel: context.energyLevel,
      trend: context.trend,
      streakDays: context.streakDays,
      source: sourceTag
    },
    activities: activitiesPayload,
    questions: questionsPayload
  };

  // 8. Write to Redis Cache
  await setCachedRecommendations(userIdStr, payload);

  return payload;
};

export default {
  getCachedRecommendations,
  setCachedRecommendations,
  invalidateRecommendationCache,
  getRecommendations
};
