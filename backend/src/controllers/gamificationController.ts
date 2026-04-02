import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import StoreItem from '../models/StoreItem';
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

    const streakRestoreItem = await StoreItem.findOne({ key: 'streak-restore' }).select('_id').lean();
    const restoreEntry = streakRestoreItem
      ? (user.inventory || []).find((entry: any) => String(entry.itemId) === String((streakRestoreItem as any)._id))
      : null;
    const restoreTickets = Math.max(0, Number((restoreEntry as any)?.quantity ?? 0));
    const canRestoreStreak =
      Boolean(user.streakBroken) &&
      restoreTickets > 0 &&
      Number(user.streakBreakMissedDays || 0) <= 1 &&
      !Boolean(user.streakRestoreUsedForGap);

    res.json({
      levelProgress: {
        level,
        currentXP,
        xpPercent: Math.max(0, Math.min(1, xpProgress)),
      },
      streak: {
        currentDays: user.streak || 0,
        lastEntry,
        broken: Boolean(user.streakBroken),
        previousValue: user.streakBeforeBreak || 0,
        canRestore: canRestoreStreak,
      },
      coins: user.coins || 0,
      restoreTickets,
    });
  } catch (err) {
    next(err);
  }
};

const restoreStreak = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.streakBroken) {
      return res.status(400).json({ message: 'Streak is not broken' });
    }

    if (user.streakRestoreUsedForGap) {
      return res.status(429).json({ message: 'Streak restore already used for this gap' });
    }

    const missedDays = Number(user.streakBreakMissedDays || 0);
    if (missedDays > 1) {
      return res.status(400).json({ message: 'Only one-day missed streak gaps can be restored' });
    }

    const restoreItem = await StoreItem.findOne({ key: 'streak-restore' }).select('_id').lean();
    if (!restoreItem) {
      return res.status(500).json({ message: 'Streak restore item is not configured' });
    }

    const inventoryEntry = (user.inventory || []).find((entry: any) => String(entry.itemId) === String((restoreItem as any)._id));
    const rawQty = Number((inventoryEntry as any)?.quantity ?? 0);

    if (!Number.isFinite(rawQty)) {
      return res.status(400).json({ message: 'Invalid streak-restore ticket quantity' });
    }

    if (rawQty < 0) {
      return res.status(400).json({ message: 'Invalid negative streak-restore ticket quantity' });
    }

    const qty = rawQty;

    if (!inventoryEntry || qty <= 0) {
      return res.status(400).json({ message: 'No streak-restore tickets available' });
    }

    const previousStreak = Number(user.streakBeforeBreak || 0);
    const restoredStreak = previousStreak > 0 ? previousStreak : Math.max(1, Number(user.streak || 0) + 1);

    // Consume one ticket.
    if (qty <= 1) {
      user.inventory = (user.inventory || []).filter((entry: any) => String(entry.itemId) !== String((restoreItem as any)._id)) as any;
    } else {
      (inventoryEntry as any).quantity = qty - 1;
    }

    user.streak = restoredStreak;
    user.streakBeforeBreak = 0;
    user.streakBroken = false;
    user.streakBreakMissedDays = 0;
    user.streakRestoreUsedForGap = true;
    user.lastActiveDate = new Date();

    await user.save();

    const remainingTickets = qty > 1 ? qty - 1 : 0;

    return res.json({
      message: 'Streak restored successfully',
      streak: user.streak,
      restoreTickets: remainingTickets,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        coins: user.coins,
        streakBroken: user.streakBroken,
        streakBeforeBreak: user.streakBeforeBreak,
        inventory: user.inventory,
        preferences: user.preferences,
      },
    });
  } catch (err) {
    next(err);
  }
};

export default { gamification, restoreStreak };
