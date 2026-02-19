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
  // Prevent duplicate rewards based on last updated time
  if (user.updatedAt && new Date(user.updatedAt).getTime() >= new Date(moodDate).getTime()) {
    return { user, duplicate: true };
  }

  // Find the previous mood entry (the one before the newly created one)
  const prev = await MoodLog.findOne({ userId: user._id }).sort({ createdAt: -1 }).skip(1).limit(1);

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

export default {
  calculateBaseXP,
  calculateStreakBonus,
  calculateTotalXP,
  calculateLevelFromXP,
  updateUserProgress,
};
