import mongoose from 'mongoose';

export interface IMoodLog {
  userId: mongoose.Types.ObjectId;
  mood: string;
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const moodLogSchema = new mongoose.Schema<IMoodLog>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mood: { type: String, required: true },
    note: { type: String },
  },
  { timestamps: true }
);

const MoodLog = mongoose.model<IMoodLog>('MoodLog', moodLogSchema);

export default MoodLog;
