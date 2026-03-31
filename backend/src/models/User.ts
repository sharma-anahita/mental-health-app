import mongoose, { Types } from 'mongoose';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */

export interface IUserPreferences {
  theme?: string; // dynamic (comes from StoreItem.key)
}

export interface IUserInventoryItem {
  itemId: Types.ObjectId;
  acquiredAt?: Date;
}

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;

  xp: number;
  streak: number;
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

  inventory: IUserInventoryItem[];

  preferences: IUserPreferences;

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

    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
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
      },
      default: () => ({ theme: 'calm' }),
    },
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