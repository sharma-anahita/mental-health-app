import mongoose from 'mongoose';
import MoodLog from '../models/MoodLog';
import XPHistory from '../models/XPHistory';
import { IUser } from '../models/User';

export const calculateBaseXP = (currentStreak: number, hasNote: boolean): number => {
  const base = 10;
  const streakBonus = Math.min(2 * currentStreak, 20); // cap streak bonus at 20
  const noteBonus = hasNote ? 5 : 0;
  return base + streakBonus + noteBonus;
};

export const calculateStreakBonus = (streak: number): number => Math.min(2 * streak, 20);

export const calculateTotalXP = (currentStreak: number, hasNote: boolean): number => calculateBaseXP(currentStreak, hasNote);

export const calculateLevelFromXP = (xp: number): number => Math.floor(0.1 * Math.sqrt(xp));

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const updateUserProgress = async (
  user: mongoose.Document & IUser,
  moodDate: Date,
  hasNote = false
): Promise<{ user: typeof user; duplicate: boolean; xpGain?: number; coinGain?: number }> => {
  // Find the previous mood entry strictly before this moodDate
  const prev = await MoodLog.findOne({ userId: user._id, createdAt: { $lt: moodDate } }).sort({ createdAt: -1 });

  // Helper: start of day in UTC to avoid timezone issues
  const startOfDayUTC = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
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
    } else {
      newStreak = 1;
    }
  } else {
    // No previous entry -> start streak at 1
    newStreak = 1;
  }

  // XP
  const xpGain = calculateTotalXP(newStreak, !!hasNote);
  user.xp = (user.xp || 0) + xpGain;

  // Record XP history entry
  try {
    await XPHistory.create({ userId: user._id, amount: xpGain, reason: 'mood_log' });
  } catch (err) {
    // don't block progression if history recording fails, but log for debugging
    // (avoid using console in libraries; controller / server logs will capture uncaught rejections)
    console.error('Failed to record XPHistory:', err);
  }

  // Streak
  user.streak = newStreak;

  // Coins: base 5 per mood, +5 if streak >= 7, +10 if streak % 30 === 0
  let coinGain = 5;
  if (newStreak >= 7) coinGain += 5;
  if (newStreak % 30 === 0) coinGain += 10;
  user.coins = (user.coins || 0) + coinGain;

  // Level recalculation from XP
  user.level = calculateLevelFromXP(user.xp);

  await user.save();

  return { user, duplicate: false, xpGain, coinGain };
};

export const rewardProfileCompletion = async (
  user: mongoose.Document & IUser,
  updatedFields: string[]
): Promise<{ user: typeof user; xpGained: number }> => {
  if (!Array.isArray(updatedFields) || updatedFields.length === 0) {
    return { user, xpGained: 0 };
  }

  user.profileCompletedFields = user.profileCompletedFields || [];

  const newlyCompleted = updatedFields.filter((f) => {
    // skip if already recorded as completed
    if (user.profileCompletedFields.includes(f)) return false;
    // ensure the user actually has a non-empty value for the field
    const val = (user as any)[f];
    return val !== undefined && val !== null && !(typeof val === 'string' && val.trim() === '');
  });

  if (newlyCompleted.length === 0) return { user, xpGained: 0 };

  const xpPerField = 2;
  const xpGain = xpPerField * newlyCompleted.length;

  user.xp = (user.xp || 0) + xpGain;

  // record an XPHistory entry per field (so each completion is auditable)
  try {
    const historyDocs = newlyCompleted.map((f) => ({ userId: user._id, amount: xpPerField, reason: `profile_completion:${f}` }));
    await XPHistory.insertMany(historyDocs);
  } catch (err) {
    console.error('Failed to record profile completion XP history:', err);
  }

  // add to profileCompletedFields
  user.profileCompletedFields = Array.from(new Set([...user.profileCompletedFields, ...newlyCompleted]));

  // update level
  user.level = calculateLevelFromXP(user.xp);

  await user.save();

  return { user, xpGained: xpGain };
};

export default {
  calculateBaseXP,
  calculateStreakBonus,
  calculateTotalXP,
  calculateLevelFromXP,
  updateUserProgress,
  rewardProfileCompletion,
};
