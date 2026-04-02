import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

type AuthRequest = Request & { userId?: string };

const ALLOWED_THEMES = ['calm', 'focus', 'sunset', 'midnight'] as const;
type ThemeName = typeof ALLOWED_THEMES[number];
const ALLOWED_FONT_STYLES = ['Inter', 'Poppins', 'Roboto'] as const;
type FontStyleName = typeof ALLOWED_FONT_STYLES[number];
const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * PATCH /api/user/preferences
 * Currently supports: { theme: ThemeName, fontColor?: string, fontStyle?: FontStyleName }
 * Extend this object as more user preferences are added.
 */
export const updatePreferences = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { theme, fontColor, fontStyle } = req.body as {
      theme?: string;
      fontColor?: string;
      fontStyle?: string;
    };

    if (theme !== undefined && !ALLOWED_THEMES.includes(theme as ThemeName)) {
      return res.status(400).json({ message: `Invalid theme. Must be one of: ${ALLOWED_THEMES.join(', ')}` });
    }

    if (fontColor !== undefined && !HEX_COLOR_REGEX.test(fontColor)) {
      return res.status(400).json({ message: 'Invalid fontColor. Use a hex color like #0f172a' });
    }

    if (fontStyle !== undefined && !ALLOWED_FONT_STYLES.includes(fontStyle as FontStyleName)) {
      return res.status(400).json({ message: `Invalid fontStyle. Must be one of: ${ALLOWED_FONT_STYLES.join(', ')}` });
    }

    const updates: Record<string, any> = {};
    if (theme !== undefined) updates['preferences.theme'] = theme;
    if (fontColor !== undefined) updates['preferences.fontColor'] = fontColor;
    if (fontStyle !== undefined) updates['preferences.fontStyle'] = fontStyle;

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