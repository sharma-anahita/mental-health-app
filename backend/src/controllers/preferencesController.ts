import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

type AuthRequest = Request & { userId?: string };

const ALLOWED_THEMES = ['calm', 'focus', 'sunset', 'midnight'] as const;
type ThemeName = typeof ALLOWED_THEMES[number];

/**
 * PATCH /api/user/preferences
 * Currently supports: { theme: ThemeName }
 * Extend this object as more user preferences are added.
 */
export const updatePreferences = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { theme } = req.body as { theme?: string };

    if (theme !== undefined && !ALLOWED_THEMES.includes(theme as ThemeName)) {
      return res.status(400).json({ message: `Invalid theme. Must be one of: ${ALLOWED_THEMES.join(', ')}` });
    }

    const updates: Record<string, any> = {};
    if (theme !== undefined) updates['preferences.theme'] = theme;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid preference fields provided' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ preferences: user.preferences ?? {} });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/user/preferences
 * Returns the current user preferences (including theme).
 */
export const getPreferences = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ preferences: (user as any).preferences ?? {} });
  } catch (err) {
    next(err);
  }
};

export default { updatePreferences, getPreferences };