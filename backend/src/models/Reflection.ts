import mongoose from 'mongoose';

export interface IReflection {
  userId: mongoose.Types.ObjectId;
  text: string;
  date: Date;
  sentiment?: {
    score?: number;
    label?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const reflectionSchema = new mongoose.Schema<IReflection>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    date: { type: Date, required: true, default: () => new Date() },
    sentiment: {
      score: { type: Number },
      label: { type: String },
    },
  },
  { timestamps: true }
);

// Index for efficient queries by userId and date
reflectionSchema.index({ userId: 1, date: -1 });

const Reflection = mongoose.model<IReflection>('Reflection', reflectionSchema);

export default Reflection;
