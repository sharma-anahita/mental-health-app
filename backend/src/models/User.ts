import mongoose from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  xp: number;
  streak: number;
  coins?: number;
  level?: number;
  inventory?: Array<{
    itemId: import('mongoose').Types.ObjectId;
    acquiredAt?: Date;
  }>;
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
    level: { type: Number, default: 1 },
    inventory: {
      type: [
        {
          itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'StoreItem', required: true },
          acquiredAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>('User', userSchema);

export default User;
