"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPreferences = exports.updatePreferences = void 0;
const User_1 = __importDefault(require("../models/User"));
const ALLOWED_THEMES = ['calm', 'focus', 'sunset', 'midnight'];
/**
 * PATCH /api/user/preferences
 * Currently supports: { theme: ThemeName }
 * Extend this object as more user preferences are added.
 */
const updatePreferences = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const { theme } = req.body;
        if (theme !== undefined && !ALLOWED_THEMES.includes(theme)) {
            return res.status(400).json({ message: `Invalid theme. Must be one of: ${ALLOWED_THEMES.join(', ')}` });
        }
        const updates = {};
        if (theme !== undefined)
            updates['preferences.theme'] = theme;
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No valid preference fields provided' });
        }
        const user = await User_1.default.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        res.json({ preferences: user.preferences ?? {} });
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
