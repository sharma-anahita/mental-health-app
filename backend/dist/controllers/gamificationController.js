"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
const progressionService_1 = __importDefault(require("../services/progressionService"));
const gamification = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const user = await User_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const level = user.level || progressionService_1.default.calculateLevelFromXP(user.xp || 0);
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
    }
    catch (err) {
        next(err);
    }
};
exports.default = { gamification };
