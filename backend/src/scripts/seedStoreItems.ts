import StoreItem from '../models/StoreItem';

type SeedStoreItem = {
  name: string;
  type: 'theme' | 'fontColor' | 'fontStyle' | 'consumable';
  price: number;
  itemKey: string;
  purchasable: boolean;
  description?: string;
};

const DEFAULT_ITEMS: SeedStoreItem[] = [
  {
    name: 'Calm',
    type: 'theme',
    price: 0,
    itemKey: 'calm',
    purchasable: false,
  },
  {
    name: 'Focus',
    type: 'theme',
    price: 0,
    itemKey: 'focus',
    purchasable: false,
  },
  {
    name: 'Sunset',
    type: 'theme',
    price: 75,
    itemKey: 'sunset',
    purchasable: true,
  },
  {
    name: 'Midnight',
    type: 'theme',
    price: 100,
    itemKey: 'midnight',
    purchasable: true,
  },
  {
    name: 'Font Colors',
    type: 'fontColor',
    price: 20,
    itemKey: 'font-colors',
    purchasable: true,
    description: 'Unlock custom text color options',
  },
  {
    name: 'Font Styles',
    type: 'fontStyle',
    price: 50,
    itemKey: 'font-style',
    purchasable: true,
    description: 'Unlock custom font styles for the app',
  },
  {
    name: 'Time Travel Ticket',
    type: 'consumable',
    price: 30,
    itemKey: 'streak-restore',
    purchasable: true,
    description: 'Restore your streak if you miss a day',
  },
];

export async function seedStoreItems(): Promise<void> {
  let inserted = 0;
  let existing = 0;

  for (const item of DEFAULT_ITEMS) {
    const result = await StoreItem.updateOne(
      { key: item.itemKey },
      {
        $set: {
          active: item.purchasable,
          cost: item.price,
        },
        $setOnInsert: {
          name: item.name,
          type: item.type,
          key: item.itemKey,
          description:
            item.description ??
            (item.purchasable ? `${item.name} theme` : 'Default starter theme'),
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      inserted++;
      console.log(`[seed] inserted: ${item.itemKey}`);
    } else {
      existing++;
      console.log(`[seed] exists: ${item.itemKey}`);
    }
  }

  console.log(`[seed] completed → inserted=${inserted}, existing=${existing}`);
}

import 'dotenv/config';
import mongoose from 'mongoose';

if (require.main === module) {
  (async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error('❌ MONGO_URI not set in environment');
      process.exit(1);
    }
    console.log('Connecting to MongoDB for seeding...');
    await mongoose.connect(uri);
    console.log('✅ Connected. Seeding store items...');
    await seedStoreItems();
    await mongoose.disconnect();
    console.log('Disconnected. Seeding complete.');
  })().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
}