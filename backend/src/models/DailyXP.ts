import mongoose from 'mongoose';

export interface IDailyXP {
  userId: mongoose.Types.ObjectId;
  date: Date; // UTC date (start of day: 00:00:00 UTC)
  xpGained: number; // Total XP gained on this day
  createdAt?: Date;
  updatedAt?: Date;
}

const dailyXPSchema = new mongoose.Schema<IDailyXP>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    xpGained: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

// Compound index: ensure one record per user per day
dailyXPSchema.index({ userId: 1, date: 1 }, { unique: true });

const DailyXP = mongoose.model<IDailyXP>('DailyXP', dailyXPSchema);

export default DailyXP;
