/**
 * Migration: Create DailyXP collection index
 *
 * Run once after deploying the DailyXP model:
 *   cd backend && npx ts-node src/scripts/createDailyXPIndex.ts
 *
 * What this does:
 *   1. Connects to MongoDB using MONGO_URI from .env
 *   2. Creates DailyXP collection (if it doesn't exist yet)
 *   3. Creates the compound unique index { userId: 1, date: 1 }
 *      which enforces one record per user per day
 *   4. Creates supporting indexes for query performance
 *
 * Safe to run multiple times — createIndex is idempotent.
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import DailyXP from '../models/DailyXP';

const run = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌  MONGO_URI not set in environment');
    process.exit(1);
  }

  console.log('Connecting to MongoDB…');
  await mongoose.connect(uri);
  console.log('✅  Connected\n');

  // syncIndexes() drops any stale indexes and creates all indexes
  // defined on the schema (including the compound unique index).
  console.log('Creating indexes on DailyXP collection…');
  await DailyXP.syncIndexes();
  console.log('✅  DailyXP indexes synced\n');

  // Verify what was created
  const indexes = await DailyXP.collection.indexes();
  console.log('Current DailyXP indexes:');
  indexes.forEach((idx) => {
    console.log(`  - ${JSON.stringify(idx.key)}  unique=${idx.unique ?? false}  name=${idx.name}`);
  });

  await mongoose.disconnect();
  console.log('\nDone. Migration complete.');
};

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});