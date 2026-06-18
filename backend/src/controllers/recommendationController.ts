import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import recommendationService from '../services/recommendationService';
import Recommendation from '../models/Recommendation';
import RecommendationFeedback from '../models/RecommendationFeedback';
import Activity from '../models/Activity';
import ReflectionQuestion from '../models/ReflectionQuestion';

type AuthRequest = Request & { userId?: string };

/**
 * GET /api/recommendations
 * Query: refresh = true / false (bypasses Redis cache if true)
 */
export const getRecommendations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const forceRefresh = req.query.refresh === 'true';
    const response = await recommendationService.getRecommendations(userId, forceRefresh);
    res.json(response);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/recommendations/activities
 * Query: category = string (optional), limit = number (optional)
 */
export const getRecommendedActivities = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const recs = await recommendationService.getRecommendations(userId, false);

    let activities = recs.activities;

    const { category, limit } = req.query;
    if (category) {
      activities = activities.filter((act) => act.category === String(category));
    }
    if (limit) {
      activities = activities.slice(0, Number(limit));
    }

    res.json({ activities });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/recommendations/questions
 * Query: limit = number (optional)
 */
export const getRecommendedQuestions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const recs = await recommendationService.getRecommendations(userId, false);

    let questions = recs.questions;

    const { limit } = req.query;
    if (limit) {
      questions = questions.slice(0, Number(limit));
    }

    res.json({ questions });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/recommendations/feedback
 * Body: { recommendationId: string, targetType: 'activity' | 'question', targetId: string, rating: 'helpful' | 'not_helpful' }
 */
export const recordFeedback = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { recommendationId, targetType, targetId, rating } = req.body as {
      recommendationId: string;
      targetType: 'activity' | 'question';
      targetId: string;
      rating: 'helpful' | 'not_helpful';
    };

    // 1. Validations
    if (!recommendationId || !targetType || !targetId || !rating) {
      return res.status(400).json({ message: 'Missing required feedback fields' });
    }

    if (rating !== 'helpful' && rating !== 'not_helpful') {
      return res.status(400).json({ message: 'Invalid rating value' });
    }

    if (targetType !== 'activity' && targetType !== 'question') {
      return res.status(400).json({ message: 'Invalid target type' });
    }

    const recObjectId = new mongoose.Types.ObjectId(recommendationId);
    const targetObjectId = new mongoose.Types.ObjectId(targetId);

    // Verify recommendation snapshot exists and belongs to this user
    const rec = await Recommendation.findOne({ _id: recObjectId, userId });
    if (!rec) {
      return res.status(404).json({ message: 'Recommendation snapshot not found' });
    }

    // Verify targetId is present in this recommendation snapshot
    let targetKey = '';
    if (targetType === 'activity') {
      const hasActivity = rec.activities.some((a) => String(a.activityId) === targetId);
      if (!hasActivity) {
        return res.status(400).json({ message: 'Activity not part of this recommendation' });
      }
      const activity = await Activity.findById(targetObjectId).select('key').lean();
      if (!activity) return res.status(404).json({ message: 'Activity not found in collection' });
      targetKey = activity.key;
    } else {
      const hasQuestion = rec.questions.some((q) => String(q.questionId) === targetId);
      if (!hasQuestion) {
        return res.status(400).json({ message: 'Question not part of this recommendation' });
      }
      const question = await ReflectionQuestion.findById(targetObjectId).select('key').lean();
      if (!question) return res.status(404).json({ message: 'Reflection Question not found in collection' });
      targetKey = question.key;
    }

    // 2. Upsert feedback record
    await RecommendationFeedback.findOneAndUpdate(
      { recommendationId: recObjectId, targetId: targetObjectId },
      {
        userId: new mongoose.Types.ObjectId(userId),
        targetType,
        targetKey,
        rating,
        completedActivity: false
      },
      { upsert: true, new: true }
    );

    // 3. Side Effect: Invalidate recommendation cache
    await recommendationService.invalidateRecommendationCache(userId);

    res.json({ message: 'Feedback recorded', rating });
  } catch (err) {
    next(err);
  }
};

export default {
  getRecommendations,
  getRecommendedActivities,
  getRecommendedQuestions,
  recordFeedback
};
