"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewardProfileCompletion = exports.updateUserProgress = exports.updateDailyXP = exports.calculateLevelFromXP = exports.calculateTotalXP = exports.calculateStreakBonus = exports.calculateBaseXP = void 0;
const MoodLog_1 = __importDefault(require("../models/MoodLog"));
const XPHistory_1 = __importDefault(require("../models/XPHistory"));
const DailyXP_1 = __importDefault(require("../models/DailyXP"));
const calculateBaseXP = (currentStreak, hasNote) => {
    const base = 10;
    const streakBonus = Math.min(2 * currentStreak, 20); // cap streak bonus at 20
    const noteBonus = hasNote ? 5 : 0;
    return base + streakBonus + noteBonus;
};
exports.calculateBaseXP = calculateBaseXP;
const calculateStreakBonus = (streak) => Math.min(2 * streak, 20);
exports.calculateStreakBonus = calculateStreakBonus;
const calculateTotalXP = (currentStreak, hasNote) => (0, exports.calculateBaseXP)(currentStreak, hasNote);
exports.calculateTotalXP = calculateTotalXP;
const calculateLevelFromXP = (xp) => Math.floor(0.1 * Math.sqrt(xp));
exports.calculateLevelFromXP = calculateLevelFromXP;
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const startOfUtcWeekMonday = (d) => {
    const dayStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const day = dayStart.getUTCDay(); // 0=Sun ... 6=Sat
    const offsetToMonday = (day + 6) % 7;
    dayStart.setUTCDate(dayStart.getUTCDate() - offsetToMonday);
    return dayStart;
};
// Helper: Update daily XP for a user on a given date
const updateDailyXP = async (userId, xpAmount, date) => {
    // Calculate start of day in UTC
    const dayStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    try {
        // Try to find existing daily XP record
        const existing = await DailyXP_1.default.findOne({ userId, date: dayStart });
        if (existing) {
            // Increment existing record
            existing.xpGained += xpAmount;
            await existing.save();
        }
        else {
            // Create new record
            await DailyXP_1.default.create({ userId, date: dayStart, xpGained: xpAmount });
        }
    }
    catch (err) {
        // Don't block XP reward if daily tracking fails
        console.error('Failed to update daily XP:', err);
    }
};
exports.updateDailyXP = updateDailyXP;
const updateUserProgress = async (user, moodDate, hasNote = false) => {
    // Find the previous mood entry strictly before this moodDate
    const prev = await MoodLog_1.default.findOne({ userId: user._id, createdAt: { $lt: moodDate } }).sort({ createdAt: -1 });
    // Helper: start of day in UTC to avoid timezone issues
    const startOfDayUTC = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const msPerDay = 1000 * 60 * 60 * 24;
    let newStreak = 1;
    if (prev && prev.createdAt) {
        const prevDay = startOfDayUTC(new Date(prev.createdAt));
        const moodDay = startOfDayUTC(new Date(moodDate));
        const diffDays = Math.round((moodDay.getTime() - prevDay.getTime()) / msPerDay);
        if (diffDays === 0) {
            // Duplicate for same UTC day
            return { user, duplicate: true };
        }
        if (diffDays === 1) {
            newStreak = (user.streak || 0) + 1;
        }
        else {
            newStreak = 1;
        }
    }
    else {
        // No previous entry -> start streak at 1
        newStreak = 1;
    }
    // XP
    const xpGain = (0, exports.calculateTotalXP)(newStreak, !!hasNote);
    user.xp = (user.xp || 0) + xpGain;
    // Record XP history entry
    try {
        await XPHistory_1.default.create({ userId: user._id, amount: xpGain, reason: 'mood_log' });
    }
    catch (err) {
        // don't block progression if history recording fails, but log for debugging
        // (avoid using console in libraries; controller / server logs will capture uncaught rejections)
        console.error('Failed to record XPHistory:', err);
    }
    // Record daily XP
    await (0, exports.updateDailyXP)(user._id, xpGain, moodDate);
    // Streak
    user.streak = newStreak;
    // Coins: base 5 per mood, +5 if streak >= 7, +10 if streak % 30 === 0
    let coinGain = 5;
    if (newStreak >= 7)
        coinGain += 5;
    if (newStreak % 30 === 0)
        coinGain += 10;
    // Weekly consistency bonus: evaluate only on last UTC day of week (Sunday).
    // If weekly mood-log count is >= 5, grant +5 coins.
    const isLastUtcDayOfWeek = new Date(moodDate).getUTCDay() === 0;
    if (isLastUtcDayOfWeek) {
        const weekStart = startOfUtcWeekMonday(moodDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);
        const weeklyMoodLogCount = await MoodLog_1.default.countDocuments({
            userId: user._id,
            createdAt: { $gte: weekStart, $lt: weekEnd },
        });
        if (weeklyMoodLogCount >= 5) {
            coinGain += 5;
        }
    }
    user.coins = (user.coins || 0) + coinGain;
    // Level recalculation from XP
    user.level = (0, exports.calculateLevelFromXP)(user.xp);
    await user.save();
    return { user, duplicate: false, xpGain, coinGain };
};
exports.updateUserProgress = updateUserProgress;
const rewardProfileCompletion = async (user, updatedFields) => {
    if (!Array.isArray(updatedFields) || updatedFields.length === 0) {
        return { user, xpGained: 0 };
    }
    user.profileCompletedFields = user.profileCompletedFields || [];
    const newlyCompleted = updatedFields.filter((f) => {
        // skip if already recorded as completed
        if ((user.profileCompletedFields || []).includes(f))
            return false;
        // ensure the user actually has a non-empty value for the field
        const val = user[f];
        return val !== undefined && val !== null && !(typeof val === 'string' && val.trim() === '');
    });
    if (newlyCompleted.length === 0)
        return { user, xpGained: 0 };
    const xpPerField = 2;
    const xpGain = xpPerField * newlyCompleted.length;
    user.xp = (user.xp || 0) + xpGain;
    // record an XPHistory entry per field (so each completion is auditable)
    try {
        const historyDocs = newlyCompleted.map((f) => ({ userId: user._id, amount: xpPerField, reason: `profile_completion:${f}` }));
        await XPHistory_1.default.insertMany(historyDocs);
    }
    catch (err) {
        console.error('Failed to record profile completion XP history:', err);
    }
    // Record daily XP
    await (0, exports.updateDailyXP)(user._id, xpGain, new Date());
    // add to profileCompletedFields
    user.profileCompletedFields = Array.from(new Set([...user.profileCompletedFields, ...newlyCompleted]));
    // update level
    user.level = (0, exports.calculateLevelFromXP)(user.xp);
    await user.save();
    return { user, xpGained: xpGain };
};
exports.rewardProfileCompletion = rewardProfileCompletion;
exports.default = {
    calculateBaseXP: exports.calculateBaseXP,
    calculateStreakBonus: exports.calculateStreakBonus,
    calculateTotalXP: exports.calculateTotalXP,
    calculateLevelFromXP: exports.calculateLevelFromXP,
    updateUserProgress: exports.updateUserProgress,
    rewardProfileCompletion: exports.rewardProfileCompletion,
    updateDailyXP: exports.updateDailyXP,
    // Award XP for goal completion or other small events
    rewardGoalCompletion: async (user, xpAmount, reason = 'goal_completion') => {
        const xpGain = Number(xpAmount) || 0;
        if (xpGain === 0)
            return { user, xpGained: 0 };
        user.xp = (user.xp || 0) + xpGain;
        try {
            await XPHistory_1.default.create({ userId: user._id, amount: xpGain, reason });
        }
        catch (err) {
            console.error('Failed to record goal completion XP history:', err);
        }
        // Record daily XP
        await (0, exports.updateDailyXP)(user._id, xpGain, new Date());
        user.level = (0, exports.calculateLevelFromXP)(user.xp);
        await user.save();
        return { user, xpGained: xpGain };
    },
};
