import 'dotenv/config';
import mongoose from 'mongoose';
import Activity from '../models/Activity';
import ReflectionQuestion from '../models/ReflectionQuestion';
import { SEED_ACTIVITIES } from '../data/activityBank';
import { SEED_QUESTIONS } from '../data/questionBank';

const run = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI not set in environment');
    process.exit(1);
  }

  console.log('Connecting to MongoDB…');
  await mongoose.connect(uri);
  console.log('✅ Connected\n');

  // Seed Activities
  console.log('Seeding Activities…');
  let activityInserted = 0;
  let activityUpdated = 0;
  for (const act of SEED_ACTIVITIES) {
    const res = await Activity.updateOne(
      { key: act.key },
      { $set: act },
      { upsert: true }
    );
    if (res.upsertedCount > 0) {
      activityInserted++;
      console.log(`  [Activity] Seeded new: ${act.key}`);
    } else {
      activityUpdated++;
      console.log(`  [Activity] Updated existing: ${act.key}`);
    }
  }
  console.log(`\n✅ Activities seeded. Inserted: ${activityInserted}, Updated: ${activityUpdated}\n`);

  // Seed Reflection Questions
  console.log('Seeding Reflection Questions…');
  let questionInserted = 0;
  let questionUpdated = 0;
  for (const q of SEED_QUESTIONS) {
    const res = await ReflectionQuestion.updateOne(
      { key: q.key },
      { $set: q },
      { upsert: true }
    );
    if (res.upsertedCount > 0) {
      questionInserted++;
      console.log(`  [Question] Seeded new: ${q.key}`);
    } else {
      questionUpdated++;
      console.log(`  [Question] Updated existing: ${q.key}`);
    }
  }
  console.log(`\n✅ Reflection Questions seeded. Inserted: ${questionInserted}, Updated: ${questionUpdated}\n`);

  await mongoose.disconnect();
  console.log('Done. Seeding complete.');
};

run().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
