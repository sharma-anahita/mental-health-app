import mongoose from 'mongoose';

export type StoreItemType = 'cosmetic' | 'utility';

export interface IStoreItem {
  name: string;
  description?: string;
  cost: number;
  type: StoreItemType;

  key: string; // ⭐ ADD THIS

  effect?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
const storeItemSchema = new mongoose.Schema<IStoreItem>(
  {
    name: { type: String, required: true, index: true },
    description: { type: String },
    cost: { type: Number, required: true },

    type: { type: String, required: true, enum: ['cosmetic', 'utility'] },

    key: { type: String, required: true, unique: true }, // ⭐ IMPORTANT

    effect: { type: String }, // optional, can keep
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);
const StoreItem = mongoose.model<IStoreItem>('StoreItem', storeItemSchema);

export default StoreItem;
