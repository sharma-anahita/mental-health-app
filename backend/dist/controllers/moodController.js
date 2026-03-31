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
const DEFAULT_MOOD_PAGE_SIZE = 10;
const MAX_MOOD_PAGE_SIZE = 50;
const encodeCursor = (payload) => Buffer.from(JSON.stringify(payload)).toString('base64url');
const decodeCursor = (cursor) => {
    if (!cursor)
        return null;
    try {
        const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf-8'));
        if (!decoded.createdAt || !decoded.id)
            return null;
        return decoded;
    }
    catch {
        return null;
    }
};
const newerThan = (createdAt, id) => ({
    $or: [{ createdAt: { $gt: createdAt } }, { createdAt, _id: { $gt: id } }],
});
const olderThan = (createdAt, id) => ({
    $or: [{ createdAt: { $lt: createdAt } }, { createdAt, _id: { $lt: id } }],
});
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
        const rawLimit = Number(req.query.limit ?? DEFAULT_MOOD_PAGE_SIZE);
        const limit = Number.isFinite(rawLimit)
            ? Math.min(Math.max(Math.trunc(rawLimit), 1), MAX_MOOD_PAGE_SIZE)
            : DEFAULT_MOOD_PAGE_SIZE;
        const direction = req.query.direction === 'prev' ? 'prev' : 'next';
        const cursor = decodeCursor(typeof req.query.cursor === 'string' ? req.query.cursor : undefined);
        const baseFilter = { userId };
        if (cursor) {
            const cursorCreatedAt = new Date(cursor.createdAt);
            const cursorId = new mongoose_1.default.Types.ObjectId(cursor.id);
            Object.assign(baseFilter, direction === 'prev' ? newerThan(cursorCreatedAt, cursorId) : olderThan(cursorCreatedAt, cursorId));
        }
        const sort = direction === 'prev' ? { createdAt: 1, _id: 1 } : { createdAt: -1, _id: -1 };
        const rows = await MoodLog_1.default.find(baseFilter)
            .sort(sort)
            .limit(limit + 1);
        const hasMoreInRequestedDirection = rows.length > limit;
        const pageRows = hasMoreInRequestedDirection ? rows.slice(0, limit) : rows;
        const orderedRows = direction === 'prev' ? pageRows.reverse() : pageRows;
        if (orderedRows.length === 0) {
            return res.json({
                moods: [],
                pageInfo: {
                    limit,
                    nextCursor: null,
                    prevCursor: null,
                    hasNextPage: false,
                    hasPrevPage: false,
                },
            });
        }
        const first = orderedRows[0];
        const last = orderedRows[orderedRows.length - 1];
        const [hasPrevPage, hasNextPage] = await Promise.all([
            MoodLog_1.default.exists({ userId, ...newerThan(first.createdAt, first._id) }).then(Boolean),
            MoodLog_1.default.exists({ userId, ...olderThan(last.createdAt, last._id) }).then(Boolean),
        ]);
        const nextCursor = hasNextPage
            ? encodeCursor({ createdAt: last.createdAt.toISOString(), id: String(last._id) })
            : null;
        const prevCursor = hasPrevPage
            ? encodeCursor({ createdAt: first.createdAt.toISOString(), id: String(first._id) })
            : null;
        res.json({
            moods: orderedRows,
            pageInfo: {
                limit,
                nextCursor,
                prevCursor,
                hasNextPage,
                hasPrevPage,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getMoods = getMoods;
exports.default = { createMood: exports.createMood, getMoods: exports.getMoods };
