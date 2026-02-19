import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import progressionService from '../services/progressionService';

type AuthRequest = Request & { userId?: string };

const gamification = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const level = user.level || progressionService.calculateLevelFromXP(user.xp || 0);
    const currentXP = user.xp || 0;

    const minXpForLevel = 100 * Math.pow(level, 2);
    const nextLevel = level + 1;
    const nextLevelXp = 100 * Math.pow(nextLevel, 2);
    const xpProgress = nextLevelXp - minXpForLevel > 0 ? (currentXP - minXpForLevel) / (nextLevelXp - minXpForLevel) : 0;

    // find last mood entry date for convenience (not required)
    const lastEntry = user.updatedAt ? user.updatedAt.toISOString() : null;

    res.json({
      levelProgress: {
        level,
        currentXP,
        xpPercent: Math.max(0, Math.min(1, xpProgress)),
      },
      streak: {
        currentDays: user.streak || 0,
        lastEntry,
      },
      coins: user.coins || 0,
    });
  } catch (err) {
    next(err);
  }
};

export default { gamification };
