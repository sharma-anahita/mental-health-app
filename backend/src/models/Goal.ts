import mongoose from 'mongoose';

export interface IGoal extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  type: 'daily' | 'weekly';
  text: string;
  completed: boolean;
  completedAt?: Date | null;
  createdAt: Date;
}

const GoalSchema = new mongoose.Schema<IGoal>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['daily', 'weekly'], required: true },
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IGoal>('Goal', GoalSchema);
