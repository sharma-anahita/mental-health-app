"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMoods = exports.createMood = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const MoodLog_1 = __importDefault(require("../models/MoodLog"));
const User_1 = __importDefault(require("../models/User"));
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const createMood = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const { mood, note } = req.body;
        if (!mood)
            return res.status(400).json({ message: 'mood is required' });
        // create mood log
        const moodLog = await MoodLog_1.default.create({ userId: new mongoose_1.default.Types.ObjectId(userId), mood, note });
        // update user streak and xp
        const user = await User_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const last = await MoodLog_1.default.findOne({ userId }).sort({ createdAt: -1 }).skip(1).limit(1);
        // Note: skip(1) because the most recent is the mood we just created; want previous entry
        const now = new Date();
        let newStreak = 1;
        if (last && last.createdAt) {
            const lastDay = startOfDay(new Date(last.createdAt));
            const diff = Math.round((startOfDay(now).getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));
            if (diff === 1) {
                newStreak = (user.streak || 0) + 1;
            }
            else {
                newStreak = 1;
            }
        }
        else {
            // no previous logs -> either first log or only current
            newStreak = 1;
        }
        user.streak = newStreak;
        user.xp = (user.xp || 0) + 10;
        await user.save();
        res.status(201).json({ mood: moodLog, stats: { xp: user.xp, streak: user.streak } });
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
