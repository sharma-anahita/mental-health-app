import mongoose from 'mongoose';

export interface IXPHistory {
  userId: mongoose.Types.ObjectId;
  amount: number;
  reason: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const xpHistorySchema = new mongoose.Schema<IXPHistory>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
  },
  { timestamps: true }
);

const XPHistory = mongoose.model<IXPHistory>('XPHistory', xpHistorySchema);

export default XPHistory;
