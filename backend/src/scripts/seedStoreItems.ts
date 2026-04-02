import StoreItem from '../models/StoreItem';

type SeedStoreItem = {
  name: string;
  type: 'theme';
  price: number;
  itemKey: string;
  purchasable: boolean;
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
    price: 50,
    itemKey: 'focus',
    purchasable: true,
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
];

export async function seedStoreItems(): Promise<void> {
  let inserted = 0;
  let existing = 0;

  for (const item of DEFAULT_ITEMS) {
    const result = await StoreItem.updateOne(
      { key: item.itemKey },
      {
        $setOnInsert: {
          name: item.name,
          type: item.type,
          cost: item.price,
          key: item.itemKey,
          active: item.purchasable,
          description: item.purchasable
            ? `${item.name} theme`
            : 'Default starter theme',
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