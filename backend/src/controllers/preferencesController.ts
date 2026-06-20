import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import StoreItem from '../models/StoreItem';

type AuthRequest = Request & { userId?: string };

const ALLOWED_THEMES = ['calm', 'focus', 'sunset', 'midnight'] as const;
type ThemeName = typeof ALLOWED_THEMES[number];
const ALLOWED_FONT_STYLES = [
  'Inter',
  'Manrope',
  'Nunito',
  'Poppins',
  'Merriweather',
  'Plus Jakarta Sans',
  'Outfit',
  'Open Sans'
] as const;
type FontStyleName = typeof ALLOWED_FONT_STYLES[number];
const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

async function getOwnedItemKeys(userId: string): Promise<Set<string>> {
  const user = await User.findById(userId).populate('inventory.itemId').lean();
  const ownedKeys = new Set<string>();
  if (!user) return ownedKeys;

  if (Array.isArray(user.inventory)) {
    for (const entry of user.inventory) {
      if (typeof entry === 'string') {
        ownedKeys.add(entry);
      } else if (entry && typeof entry === 'object') {
        if (entry.itemId && typeof entry.itemId === 'object') {
          const item = entry.itemId as any;
          const key = item.key || item.itemKey;
          if (key) ownedKeys.add(String(key));
        } else if (entry.itemId) {
          const item = await StoreItem.findById(entry.itemId).select('key').lean();
          if (item?.key) ownedKeys.add(item.key);
        }
      }
    }
  }
  return ownedKeys;
}

/**
 * PATCH /api/user/preferences
 * PATCH /api/preferences
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

    const FREE_THEMES = ['calm', 'focus'];
    const DEFAULT_FONT_COLOR = '#0f172a';
    const DEFAULT_FONT_STYLE = 'Inter';

    let ownedKeys: Set<string> | null = null;
    const getOwned = async () => {
      if (!ownedKeys) {
        ownedKeys = await getOwnedItemKeys(userId);
      }
      return ownedKeys;
    };

    if (theme !== undefined && !FREE_THEMES.includes(theme)) {
      const owned = await getOwned();
      if (!owned.has(theme)) {
        return res.status(403).json({ message: `You have not purchased the ${theme} theme` });
      }
    }

    if (fontColor !== undefined && fontColor !== DEFAULT_FONT_COLOR) {
      const owned = await getOwned();
      if (!owned.has('font-colors')) {
        return res.status(403).json({ message: 'You have not purchased the Font Colors customization feature' });
      }
    }

    if (fontStyle !== undefined && fontStyle !== DEFAULT_FONT_STYLE) {
      const owned = await getOwned();
      if (!owned.has('font-style')) {
        return res.status(403).json({ message: 'You have not purchased the Font Styles customization feature' });
      }
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

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        coins: user.coins,
        preferences: user.preferences ?? {},
      },
      preferences: user.preferences ?? {},
    });
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