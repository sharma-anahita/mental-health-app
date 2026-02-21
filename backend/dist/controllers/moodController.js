"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMoods = exports.createMood = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const MoodLog_1 = __importDefault(require("../models/MoodLog"));
const User_1 = __importDefault(require("../models/User"));
const progressionService_1 = __importDefault(require("../services/progressionService"));
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const createMood = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const { mood, note } = req.body;
        if (!mood)
            return res.status(400).json({ message: 'mood is required' });
        // Prevent duplicate for the same UTC day: check existing mood within that day
        const now = new Date();
        const startOfDayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
        const endOfDayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
        const existing = await MoodLog_1.default.findOne({ userId, createdAt: { $gte: startOfDayUTC, $lte: endOfDayUTC } });
        if (existing) {
            return res.status(409).json({ message: 'Duplicate mood for today', mood: existing });
        }
        // create mood log
        const moodLog = await MoodLog_1.default.create({ userId: new mongoose_1.default.Types.ObjectId(userId), mood, note });
        // update user streak and xp using progressionService
        const user = await User_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const result = await progressionService_1.default.updateUserProgress(user, moodLog.createdAt || new Date(), !!moodLog.note);
        if (result.duplicate) {
            // remove the mood we just created to avoid duplicate entries
            await MoodLog_1.default.findByIdAndDelete(moodLog._id);
            return res.status(409).json({ message: 'Duplicate mood for today' });
        }
        const updatedUser = result.user;
        res.status(201).json({ mood: moodLog, stats: { xp: updatedUser.xp, streak: updatedUser.streak, coins: updatedUser.coins, level: updatedUser.level } });
    }
    catch (err) {
        next(err);
    }
};
exports.createMood = createMood;
const getMoods = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const moods = await MoodLog_1.default.find({ userId }).sort({ createdAt: -1 });
        res.json({ moods });
    }
    catch (err) {
        next(err);
    }
};
exports.getMoods = getMoods;
exports.default = { createMood: exports.createMood, getMoods: exports.getMoods };
