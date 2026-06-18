import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  key: string;              // unique slug: e.g., "10-min-walk"
  title: string;
  description: string;
  category: 'physical' | 'cognitive' | 'creative' | 'social' | 'mindfulness';
  durationMinutes: number;
  targetMoods: string[];    // moods this activity targets
  targetEnergyLevels: ('low' | 'medium' | 'high')[];
  contraindicated: string[]; // moods/energy levels where this is a bad fit
  tags: string[];           // tags like 'grounding', 'gentle', etc.
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    key: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['physical', 'cognitive', 'creative', 'social', 'mindfulness'],
      required: true,
      index: true
    },
    durationMinutes: { type: Number, required: true },
    targetMoods: { type: [String], required: true, index: true },
    targetEnergyLevels: { type: [String], enum: ['low', 'medium', 'high'], required: true },
    contraindicated: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Activity = mongoose.model<IActivity>('Activity', ActivitySchema);

export default Activity;
