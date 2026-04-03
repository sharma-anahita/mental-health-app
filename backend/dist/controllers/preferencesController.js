"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPreferences = exports.updatePreferences = void 0;
const User_1 = __importDefault(require("../models/User"));
const ALLOWED_THEMES = ['calm', 'focus', 'sunset', 'midnight'];
const ALLOWED_FONT_STYLES = ['Inter', 'Poppins', 'Roboto'];
const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
/**
 * PATCH /api/user/preferences
 * PATCH /api/preferences
 * Currently supports: { theme: ThemeName, fontColor?: string, fontStyle?: FontStyleName }
 * Extend this object as more user preferences are added.
 */
const updatePreferences = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const { theme, fontColor, fontStyle } = req.body;
        if (theme !== undefined && !ALLOWED_THEMES.includes(theme)) {
            return res.status(400).json({ message: `Invalid theme. Must be one of: ${ALLOWED_THEMES.join(', ')}` });
        }
        if (fontColor !== undefined && !HEX_COLOR_REGEX.test(fontColor)) {
            return res.status(400).json({ message: 'Invalid fontColor. Use a hex color like #0f172a' });
        }
        if (fontStyle !== undefined && !ALLOWED_FONT_STYLES.includes(fontStyle)) {
            return res.status(400).json({ message: `Invalid fontStyle. Must be one of: ${ALLOWED_FONT_STYLES.join(', ')}` });
        }
        const updates = {};
        if (theme !== undefined)
            updates['preferences.theme'] = theme;
        if (fontColor !== undefined)
            updates['preferences.fontColor'] = fontColor;
        if (fontStyle !== undefined)
            updates['preferences.fontStyle'] = fontStyle;
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No valid preference fields provided' });
        }
        const user = await User_1.default.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
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
    }
    catch (err) {
        next(err);
    }
};
exports.updatePreferences = updatePreferences;
/**
 * GET /api/user/preferences
 * Returns the current user preferences (including theme).
 */
const getPreferences = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const user = await User_1.default.findById(userId).lean();
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        res.json({ preferences: user.preferences ?? {} });
    }
    catch (err) {
        next(err);
    }
};
exports.getPreferences = getPreferences;
exports.default = { updatePreferences: exports.updatePreferences, getPreferences: exports.getPreferences };
