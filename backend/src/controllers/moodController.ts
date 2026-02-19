import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import MoodLog, { IMoodLog } from '../models/MoodLog';
import User, { IUser } from '../models/User';
import progressionService from '../services/progressionService';

type AuthRequest = Request & { userId?: string };

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const createMood = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { mood, note } = req.body as { mood: string; note?: string };
    if (!mood) return res.status(400).json({ message: 'mood is required' });

    // Prevent duplicate for the same UTC day: check existing mood within that day
    const now = new Date();
    const startOfDayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const endOfDayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
    const existing = await MoodLog.findOne({ userId, createdAt: { $gte: startOfDayUTC, $lte: endOfDayUTC } });
    if (existing) {
      return res.status(409).json({ message: 'Duplicate mood for today', mood: existing });
    }

    // create mood log
    const moodLog = await MoodLog.create({ userId: new mongoose.Types.ObjectId(userId), mood, note } as Partial<IMoodLog>);

    // update user streak and xp using progressionService
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const result = await progressionService.updateUserProgress(user, moodLog.createdAt || new Date(), !!moodLog.note);

    if (result.duplicate) {
      // remove the mood we just created to avoid duplicate entries
      await MoodLog.findByIdAndDelete(moodLog._id);
      return res.status(409).json({ message: 'Duplicate mood for today' });
    }

    const updatedUser = result.user;
    res.status(201).json({ mood: moodLog, stats: { xp: updatedUser.xp, streak: updatedUser.streak, coins: updatedUser.coins, level: updatedUser.level } });
  } catch (err) {
    next(err);
  }
};

export const getMoods = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const moods = await MoodLog.find({ userId }).sort({ createdAt: -1 });
    res.json({ moods });
  } catch (err) {
    next(err);
  }
};

export default { createMood, getMoods };
