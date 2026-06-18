import mongoose, { Document, Schema } from 'mongoose';

export interface IReflectionQuestion extends Document {
  key: string;              // unique slug: e.g., "energy-drain-question"
  text: string;
  targetMoods: string[];
  targetEnergyLevels: ('low' | 'medium' | 'high')[];
  targetTrends: ('declining' | 'stable' | 'improving')[];
  tags: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReflectionQuestionSchema = new Schema<IReflectionQuestion>(
  {
    key: { type: String, required: true, unique: true, index: true },
    text: { type: String, required: true },
    targetMoods: { type: [String], required: true, index: true },
    targetEnergyLevels: { type: [String], enum: ['low', 'medium', 'high'], required: true },
    targetTrends: { type: [String], enum: ['declining', 'stable', 'improving'], required: true },
    tags: { type: [String], default: [] },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const ReflectionQuestion = mongoose.model<IReflectionQuestion>('ReflectionQuestion', ReflectionQuestionSchema);

export default ReflectionQuestion;
