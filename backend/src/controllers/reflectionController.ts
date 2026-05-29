import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Reflection, { IReflection } from '../models/Reflection';
import User, { IUser } from '../models/User';
import progressionService from '../services/progressionService';
import * as mlService from '../services/mlService';

type AuthRequest = Request & { userId?: string };

const getStartOfDay = (d: Date = new Date()) => {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
};

const getEndOfDay = (d: Date = new Date()) => {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
};

const REFLECTION_XP_REWARD = 20;
const REFLECTION_COIN_REWARD = 5;

/**
 * Create a reflection for the current user
 * POST /api/reflections
 */
export const createReflection = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { text } = req.body as { text?: string };
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'text is required' });
    }

    // Check if user already has a reflection for today
    const now = new Date();
    const startOfDayUTC = getStartOfDay(now);
    const endOfDayUTC = getEndOfDay(now);

    const existingReflection = await Reflection.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: startOfDayUTC, $lte: endOfDayUTC },
    });

    if (existingReflection) {
      // Update existing reflection instead of creating a duplicate
      existingReflection.text = text.trim();
      existingReflection.updatedAt = new Date();
      await existingReflection.save();
      return res.status(200).json({ reflection: existingReflection, message: 'Reflection updated' });
    }

    // Create new reflection
    const reflection = await Reflection.create({
      userId: new mongoose.Types.ObjectId(userId),
      text: text.trim(),
      date: now,
    } as Partial<IReflection>);

    // Attempt sentiment analysis (optional; don't fail if ML service is down)
    try {
      const sentimentResult = await mlService.analyzeReflection(text);
      reflection.sentiment = {
        score: sentimentResult.sentimentScore,
        label: sentimentResult.sentimentLabel,
      };
      await reflection.save();
    } catch (analyzeErr) {
      // Log but don't throw; reflection is created even if sentiment analysis fails
      console.warn('Sentiment analysis failed:', analyzeErr);
    }

    // Award XP and coins to user for submitting a reflection
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { xp: REFLECTION_XP_REWARD, coins: REFLECTION_COIN_REWARD } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.level = progressionService.calculateLevelFromXP(user.xp || 0);
    await user.save();

    res.status(201).json({
      reflection,
      stats: {
        xp: user.xp,
        coins: user.coins,
        level: user.level,
        streak: user.streak,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get reflection for today
 * GET /api/reflections/today
 */
export const getReflectionToday = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const now = new Date();
    const startOfDayUTC = getStartOfDay(now);
    const endOfDayUTC = getEndOfDay(now);

    const reflection = await Reflection.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: startOfDayUTC, $lte: endOfDayUTC },
    });

    res.json({ reflection });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all reflections for user (paginated)
 * GET /api/reflections
 */
export const getReflections = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const limit = Math.min(parseInt(req.query.limit as string) || 30, 100);
    const skip = parseInt(req.query.skip as string) || 0;

    const reflections = await Reflection.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ date: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Reflection.countDocuments({ userId: new mongoose.Types.ObjectId(userId) });

    res.json({ reflections, total, limit, skip });
  } catch (err) {
    next(err);
  }
};

export default { createReflection, getReflectionToday, getReflections };
