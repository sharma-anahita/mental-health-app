import mongoose from 'mongoose';

export interface IUserPreferences {
  theme?: 'calm' | 'focus' | 'sunset' | 'midnight';
}

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  xp: number;
  streak: number;
  coins?: number;
  level?: number;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  phone?: string;
  location?: string;
  profileCompletedFields?: string[];
  inventory?: Array<{
    itemId: import('mongoose').Types.ObjectId;
    acquiredAt?: Date;
  }>;
  // ── User preferences (theme, future settings) ──
  preferences?: IUserPreferences;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    // Optional profile fields
    username: { type: String, unique: true, sparse: true },
    bio: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    profileCompletedFields: { type: [String], default: [] },
    inventory: {
      type: [
        {
          itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'StoreItem', required: true },
          acquiredAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    // ── Preferences sub-document ──
    preferences: {
      type: {
        theme: {
          type: String,
          enum: ['calm', 'focus', 'sunset', 'midnight'],
          default: 'calm',
        },
      },
      default: () => ({ theme: 'calm' }),
    },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>('User', userSchema);

export default User;