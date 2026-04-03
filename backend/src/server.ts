import 'dotenv/config';
import app from './app';
import connectDB from './config/db';
import { seedStoreItems } from './scripts/seedStoreItems';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // ✅ connect DB first
    await connectDB();

    // ✅ seed AFTER DB connection
    // await seedStoreItems();

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();