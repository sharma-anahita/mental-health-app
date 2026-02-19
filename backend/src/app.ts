import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import moodRoutes from './routes/moodRoutes';
import gamificationRoutes from './routes/gamificationRoutes';

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/gamification', gamificationRoutes);

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
