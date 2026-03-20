import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import progressionService from '../services/progressionService';

type AuthRequest = Request & { userId?: string };

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const allowedFields = ['username', 'bio', 'avatarUrl', 'country', 'countryCode', 'phoneNumber', 'fullNumber', 'phone', 'location'];
    const updates = req.body as Record<string, any>;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profileCompletedFields = user.profileCompletedFields || [];

    // Determine which fields are newly filled in this update
    const newlyFilled: string[] = [];
    for (const field of allowedFields) {
      if (!(field in updates)) continue;
      const newVal = updates[field];
      const prevVal = (user as any)[field];
      const prevEmpty = prevVal === undefined || prevVal === null || (typeof prevVal === 'string' && prevVal.trim() === '');
      const newFilled = newVal !== undefined && newVal !== null && !(typeof newVal === 'string' && newVal.trim() === '');
      // Apply the update
      (user as any)[field] = newVal;
      if (prevEmpty && newFilled) newlyFilled.push(field);
    }

    // Delegate XP awarding and persistence to progressionService
    let xpGained = 0;
    if (newlyFilled.length > 0) {
      const result = await progressionService.rewardProfileCompletion(user, newlyFilled);
      xpGained = result.xpGained;
    } else {
      await user.save();
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        country: user.country,
        countryCode: user.countryCode,
        phoneNumber: user.phoneNumber,
        fullNumber: user.fullNumber,
        phone: user.phone,
        location: user.location,
        xp: user.xp,
        profileCompletedFields: user.profileCompletedFields,
        streak: user.streak,
        coins: user.coins,
        level: user.level,
      },
      xpGained,
    });
  } catch (err: any) {
    // handle duplicate username index error gracefully
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'Duplicate value', detail: err.message });
    }
    next(err);
  }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        country: user.country,
        countryCode: user.countryCode,
        phoneNumber: user.phoneNumber,
        fullNumber: user.fullNumber,
        phone: user.phone,
        location: user.location,
        xp: user.xp,
        profileCompletedFields: user.profileCompletedFields,
        streak: user.streak,
        coins: user.coins,
        level: user.level,
      },
    });
  } catch (err) {
    next(err);
  }
};

export default { updateProfile, getProfile };
