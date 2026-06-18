import mongoose, { Document, Schema } from 'mongoose';

export interface IRecommendationFeedback extends Document {
  userId: mongoose.Types.ObjectId;
  recommendationId: mongoose.Types.ObjectId;
  targetType: 'activity' | 'question';
  targetId: mongoose.Types.ObjectId;
  targetKey: string;
  rating: 'helpful' | 'not_helpful';
  completedActivity: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RecommendationFeedbackSchema = new Schema<IRecommendationFeedback>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recommendationId: { type: Schema.Types.ObjectId, ref: 'Recommendation', required: true },
    targetType: { type: String, enum: ['activity', 'question'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    targetKey: { type: String, required: true },
    rating: { type: String, enum: ['helpful', 'not_helpful'], required: true },
    completedActivity: { type: Boolean, default: false },
    notes: { type: String }
  },
  { timestamps: true }
);

// One rating per item per recommendation session (enforced uniquely)
RecommendationFeedbackSchema.index({ recommendationId: 1, targetId: 1 }, { unique: true });

// Standard index for query convenience on user feedback history
RecommendationFeedbackSchema.index({ userId: 1, targetId: 1 });

// Index for penalizing disliked items in scoring
RecommendationFeedbackSchema.index({ userId: 1, rating: 1 });

// Index for future aggregate quality scoring
RecommendationFeedbackSchema.index({ targetId: 1, rating: 1 });

const RecommendationFeedback = mongoose.model<IRecommendationFeedback>('RecommendationFeedback', RecommendationFeedbackSchema);

export default RecommendationFeedback;
