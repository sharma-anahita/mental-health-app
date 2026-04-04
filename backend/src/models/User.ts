import mongoose, { Types } from 'mongoose';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */

export interface IUserPreferences {
  theme?: string; // dynamic (comes from StoreItem.key)
  fontColor?: string;
  fontStyle?: string;
}

export interface IUserInventoryItem {
  itemId: Types.ObjectId;
  quantity?: number;
  acquiredAt?: Date;
}

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  googleId?: string;

  xp: number;
  streak: number;
  streakBeforeBreak?: number;
  streakBroken?: boolean;
  streakBreakMissedDays?: number;
  streakRestoreUsedForGap?: boolean;
  lastActiveDate?: Date;
  coins: number;
  level: number;

  username?: string;
  bio?: string;
  avatarUrl?: string;

  country?: string;
  countryCode?: string;
  phoneNumber?: string;
  fullNumber?: string;
  phone?: string;
  location?: string;

  profileCompletedFields?: string[];
  profileCompletionRewardClaimed?: boolean;

  inventory: IUserInventoryItem[];

  preferences: IUserPreferences;

  // ── Password Reset ──
  passwordResetToken?: string;
  passwordResetExpiry?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

/* ─────────────────────────────────────────────
   Schema
───────────────────────────────────────────── */

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    passwordHash: { type: String, required: true },
    googleId: { type: String, unique: true, sparse: true },

    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    streakBeforeBreak: { type: Number, default: 0 },
    streakBroken: { type: Boolean, default: false },
    streakBreakMissedDays: { type: Number, default: 0, min: 0 },
    streakRestoreUsedForGap: { type: Boolean, default: false },
    lastActiveDate: { type: Date, default: Date.now },
    coins: { type: Number, default: 0 },
    level: { type: Number, default: 0 },

    // ── Profile ──
    username: { type: String, unique: true, sparse: true },
    bio: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },

    country: { type: String, default: '' },
    countryCode: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },
    fullNumber: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },

    profileCompletedFields: { type: [String], default: [] },
    profileCompletionRewardClaimed: { type: Boolean, default: false },

    // ── Inventory (store purchases) ──
    inventory: {
      type: [
        {
          itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'StoreItem',
            required: true,
            index: true, // performance boost
          },
          quantity: {
            type: Number,
            default: 1,
            min: 1,
          },
          acquiredAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },

    // ── Preferences (theme, etc.) ──
    preferences: {
      type: {
        theme: {
          type: String,
          default: 'calm', // default theme
        },
        fontColor: {
          type: String,
          default: '#0f172a',
        },
        fontStyle: {
          type: String,
          default: 'Inter',
        },
      },
      default: () => ({ theme: 'calm', fontColor: '#0f172a', fontStyle: 'Inter' }),
    },

    // ── Password Reset ──
    passwordResetToken: { type: String, default: null },
    passwordResetExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

/* ─────────────────────────────────────────────
   Indexes (optional but good)
───────────────────────────────────────────── */

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

/* ─────────────────────────────────────────────
   Model
───────────────────────────────────────────── */

const User = mongoose.model<IUser>('User', userSchema);

export default User;