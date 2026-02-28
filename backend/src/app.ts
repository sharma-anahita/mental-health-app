import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import moodRoutes from './routes/moodRoutes';
import gamificationRoutes from './routes/gamificationRoutes';
import userRoutes from './routes/userRoutes';
import goalRoutes from './routes/goalRoutes';
import insightsRoutes from './routes/insightsRoutes';

const app = express();

app.use(express.json());
// Allow the deployed frontend to access the API. Set `FRONTEND_URL` in your
// backend environment (e.g. https://mental-health-app-ebon.vercel.app).
// Falls back to localhost during development.
const allowedOrigin = process.env.FRONTEND_URL ?? 'http://localhost:5173';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/user', userRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/insights', insightsRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

interface HttpError extends Error {
  status?: number;
}

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal Server Error' });
});

export default app;
