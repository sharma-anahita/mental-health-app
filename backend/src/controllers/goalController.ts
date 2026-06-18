import { Request, Response } from 'express';
import Goal from '../models/Goal';
import User from '../models/User';
import Recommendation from '../models/Recommendation';
import progressionService from '../services/progressionService';

type AuthRequest = Request & { userId?: string };

export const listGoals = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const goals = await Goal.find({ userId }).sort({ createdAt: -1 }).lean();
  res.json({ goals });
};

export const createGoal = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { type, text } = req.body as { type: 'daily' | 'weekly' | 'recommended'; text: string };
  if (!type || !text) return res.status(400).json({ message: 'Missing type or text' });

  const goal = await Goal.create({ userId, type, text });
  res.status(201).json({ goal });
};

export const createFromRecommendation = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const { recommendationId, activityId, title } = req.body as {
    recommendationId: string;
    activityId: string;
    title: string;
  };

  if (!recommendationId || !activityId || !title) {
    return res.status(400).json({ message: 'Missing recommendationId, activityId, or title' });
  }

  if (title.length > 200) {
    return res.status(400).json({ message: 'Title must be 200 characters or less' });
  }

  // Validate recommendation exists and belongs to the requesting user
  const rec = await Recommendation.findOne({ _id: recommendationId, userId }).lean();
  if (!rec) {
    return res.status(404).json({ message: 'Recommendation snapshot not found' });
  }

  // Validate activityId is part of the recommendation's activities list
  const hasActivity = rec.activities.some((a) => String(a.activityId) === activityId);
  if (!hasActivity) {
    return res.status(400).json({ message: 'Activity is not part of this recommendation snapshot' });
  }

  // Create the goal under type 'recommended'
  const goal = await Goal.create({
    userId,
    type: 'recommended',
    text: title,
    sourceRecommendationId: recommendationId,
    sourceActivityId: activityId,
    completed: false
  });

  res.status(201).json({ goal, xpGained: 0 });
};

export const updateGoal = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  const patch = req.body as Partial<{ text: string; completed: boolean }>;

  const goal = await Goal.findOne({ _id: id, userId });
  if (!goal) return res.status(404).json({ message: 'Goal not found' });

  const wasCompleted = goal.completed;
  if (patch.text !== undefined) goal.text = patch.text;
  if (patch.completed !== undefined) {
    goal.completed = !!patch.completed;
    goal.completedAt = patch.completed ? new Date() : null;
  }

  await goal.save();

  // If newly completed, award XP
  let xpGained = 0;
  let updatedUser = null;
  if (!wasCompleted && goal.completed) {
    const user = await User.findById(userId);
    if (user) {
      // simple award: 5 XP for completing a goal
      const { user: u, xpGained: gained } = await progressionService.rewardGoalCompletion(user, 5, `goal:${goal._id}`);
      xpGained = gained;
      updatedUser = u;
    }
  }

  res.json({ goal, xpGained, user: updatedUser });
};

export const deleteGoal = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;

  const goal = await Goal.findOne({ _id: id, userId });
  if (!goal) return res.status(404).json({ message: 'Goal not found' });

  await Goal.deleteOne({ _id: id });
  res.json({ message: 'Goal deleted' });
};
