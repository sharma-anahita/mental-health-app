import 'dotenv/config';
import mongoose from 'mongoose';
import DailyXP from '../models/DailyXP';
import XPHistory from '../models/XPHistory';

const backfill = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI not set in environment');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB\n');

  // Clear existing DailyXP entries to avoid duplication
  console.log('Clearing existing DailyXP documents...');
  const deleteResult = await DailyXP.deleteMany({});
  console.log(`✅ Cleared ${deleteResult.deletedCount} DailyXP documents.\n`);

  console.log('Fetching XPHistory entries...');
  const histories = await XPHistory.find({});
  console.log(`✅ Found ${histories.length} XPHistory records.\n`);

  // Map of "userId_dateUTC" -> total XP gained
  const dailyXPMap = new Map<string, number>();

  for (const history of histories) {
    if (!history.userId || history.amount === undefined) continue;

    const userId = history.userId.toString();
    const date = history.createdAt || new Date();
    // Normalize date to UTC midnight
    const dayStartStr = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())).toISOString();
    const key = `${userId}_${dayStartStr}`;
    
    dailyXPMap.set(key, (dailyXPMap.get(key) || 0) + history.amount);
  }

  console.log(`Aggregated into ${dailyXPMap.size} unique user-day entries.`);

  const insertDocs = [];
  for (const [key, xpGained] of dailyXPMap.entries()) {
    const [userIdStr, dayStartStr] = key.split('_');
    insertDocs.push({
      userId: new mongoose.Types.ObjectId(userIdStr),
      date: new Date(dayStartStr),
      xpGained
    });
  }

  if (insertDocs.length > 0) {
    console.log('Inserting DailyXP records...');
    await DailyXP.insertMany(insertDocs);
    console.log(`✅ Successfully backfilled ${insertDocs.length} DailyXP records.\n`);
  } else {
    console.log('No records to backfill.');
  }

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB. Backfill complete.');
};

backfill().catch(err => {
  console.error('❌ Backfill failed:', err);
  process.exit(1);
});
