import mongoose from 'mongoose';

export interface IMoodLog {
  userId: mongoose.Types.ObjectId;
  mood: string;
  note?: string;
  energy?: number;
  stress?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const moodLogSchema = new mongoose.Schema<IMoodLog>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mood: { type: String, required: true },
    note: { type: String },
    energy: { type: Number, min: 1, max: 100 },
    stress: { type: Number, min: 1, max: 100 },
  },
  { timestamps: true }
);

const MoodLog = mongoose.model<IMoodLog>('MoodLog', moodLogSchema);

export default MoodLog;
