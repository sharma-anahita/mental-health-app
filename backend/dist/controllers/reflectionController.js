"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReflections = exports.getReflectionToday = exports.createReflection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Reflection_1 = __importDefault(require("../models/Reflection"));
const User_1 = __importDefault(require("../models/User"));
const progressionService_1 = __importDefault(require("../services/progressionService"));
const mlService = __importStar(require("../services/mlService"));
const getStartOfDay = (d = new Date()) => {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
};
const getEndOfDay = (d = new Date()) => {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
};
const REFLECTION_XP_REWARD = 20;
const REFLECTION_COIN_REWARD = 5;
/**
 * Create a reflection for the current user
 * POST /api/reflections
 */
const createReflection = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const { text } = req.body;
        if (!text || text.trim().length === 0) {
            return res.status(400).json({ message: 'text is required' });
        }
        // Check if user already has a reflection for today
        const now = new Date();
        const startOfDayUTC = getStartOfDay(now);
        const endOfDayUTC = getEndOfDay(now);
        const existingReflection = await Reflection_1.default.findOne({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            date: { $gte: startOfDayUTC, $lte: endOfDayUTC },
        });
        if (existingReflection) {
            // Update existing reflection instead of creating a duplicate
            existingReflection.text = text.trim();
            existingReflection.updatedAt = new Date();
            await existingReflection.save();
            return res.status(200).json({ reflection: existingReflection, message: 'Reflection updated' });
        }
        // Create new reflection
        const reflection = await Reflection_1.default.create({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            text: text.trim(),
            date: now,
        });
        // Attempt sentiment analysis (optional; don't fail if ML service is down)
        try {
            const sentimentResult = await mlService.analyzeReflection(text);
            reflection.sentiment = {
                score: sentimentResult.sentimentScore,
                label: sentimentResult.sentimentLabel,
            };
            await reflection.save();
        }
        catch (analyzeErr) {
            // Log but don't throw; reflection is created even if sentiment analysis fails
            console.warn('Sentiment analysis failed:', analyzeErr);
        }
        // Award XP and coins to user for submitting a reflection
        const user = await User_1.default.findByIdAndUpdate(userId, { $inc: { xp: REFLECTION_XP_REWARD, coins: REFLECTION_COIN_REWARD } }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.level = progressionService_1.default.calculateLevelFromXP(user.xp || 0);
        await user.save();
        res.status(201).json({
            reflection,
            stats: {
                xp: user.xp,
                coins: user.coins,
                level: user.level,
                streak: user.streak,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createReflection = createReflection;
/**
 * Get reflection for today
 * GET /api/reflections/today
 */
const getReflectionToday = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const now = new Date();
        const startOfDayUTC = getStartOfDay(now);
        const endOfDayUTC = getEndOfDay(now);
        const reflection = await Reflection_1.default.findOne({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            date: { $gte: startOfDayUTC, $lte: endOfDayUTC },
        });
        res.json({ reflection });
    }
    catch (err) {
        next(err);
    }
};
exports.getReflectionToday = getReflectionToday;
/**
 * Get all reflections for user (paginated)
 * GET /api/reflections
 */
const getReflections = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const limit = Math.min(parseInt(req.query.limit) || 30, 100);
        const skip = parseInt(req.query.skip) || 0;
        const reflections = await Reflection_1.default.find({ userId: new mongoose_1.default.Types.ObjectId(userId) })
            .sort({ date: -1 })
            .limit(limit)
            .skip(skip);
        const total = await Reflection_1.default.countDocuments({ userId: new mongoose_1.default.Types.ObjectId(userId) });
        res.json({ reflections, total, limit, skip });
    }
    catch (err) {
        next(err);
    }
};
exports.getReflections = getReflections;
exports.default = { createReflection: exports.createReflection, getReflectionToday: exports.getReflectionToday, getReflections: exports.getReflections };
