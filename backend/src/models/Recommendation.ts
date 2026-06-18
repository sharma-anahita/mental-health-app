import mongoose, { Document, Schema } from 'mongoose';

export interface IRecommendation extends Document {
  userId: mongoose.Types.ObjectId;
  
  activities: {
    activityId: mongoose.Types.ObjectId;
    score: number;
    rank: number;
  }[];
  
  questions: {
    questionId: mongoose.Types.ObjectId;
    score: number;
    rank: number;
  }[];
  
  contextSnapshot: {
    dominantMood: string;
    energyLevel: 'low' | 'medium' | 'high';
    trend: 'declining' | 'stable' | 'improving';
    consecutiveLowDays: number;
    streakDays: number;
  };
  
  generatedAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RecommendationSchema = new Schema<IRecommendation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    activities: [
      {
        activityId: { type: Schema.Types.ObjectId, ref: 'Activity', required: true },
        score: { type: Number, required: true },
        rank: { type: Number, required: true }
      }
    ],
    questions: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: 'ReflectionQuestion', required: true },
        score: { type: Number, required: true },
        rank: { type: Number, required: true }
      }
    ],
    contextSnapshot: {
      dominantMood: { type: String, required: true },
      energyLevel: { type: String, enum: ['low', 'medium', 'high'], required: true },
      trend: { type: String, enum: ['declining', 'stable', 'improving'], required: true },
      consecutiveLowDays: { type: Number, required: true },
      streakDays: { type: Number, required: true }
    },
    generatedAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

// Index to retrieve a user's recommendation runs sorted by creation time
RecommendationSchema.index({ userId: 1, generatedAt: -1 });

const Recommendation = mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);

export default Recommendation;
