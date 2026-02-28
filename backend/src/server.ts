import 'dotenv/config';
import app from './app';
import connectDB from './config/db';

import cors from "cors";

app.use(cors({
  origin: "https://mental-health-app-ebon.vercel.app",
  credentials: true
}));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
