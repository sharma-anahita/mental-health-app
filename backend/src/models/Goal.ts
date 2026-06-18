import mongoose from 'mongoose';

export interface IGoal extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  type: 'daily' | 'weekly' | 'recommended';
  text: string;
  completed: boolean;
  completedAt?: Date | null;
  sourceRecommendationId?: mongoose.Types.ObjectId | null;
  sourceActivityId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
}

const GoalSchema = new mongoose.Schema<IGoal>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['daily', 'weekly', 'recommended'], required: true },
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    sourceRecommendationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recommendation', default: null },
    sourceActivityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Index for querying goals by their generating recommendation snapshot
GoalSchema.index({ sourceRecommendationId: 1 });

export default mongoose.model<IGoal>('Goal', GoalSchema);
