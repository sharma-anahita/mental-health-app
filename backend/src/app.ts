import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import moodRoutes from './routes/moodRoutes';
import gamificationRoutes from './routes/gamificationRoutes';
import userRoutes from './routes/userRoutes';
import goalRoutes from './routes/goalRoutes';
import insightsRoutes from './routes/insightsRoutes';
import preferencesRoutes from './routes/preferencesRoutes';
import reflectionRoutes from './routes/reflectionRoutes';
import storeRoutes from './routes/storeRoutes';
import streakRoutes from './routes/streakRoutes';
// ...
const app = express();

app.use(express.json());
// Configure CORS to allow the deployed frontend and local dev origins.
// Read `FRONTEND_URL` from environment (set on Render) and include common
// localhost dev origins. Use a whitelist function so the response header
// mirrors the requesting origin when allowed.
const envFrontend = (process.env.FRONTEND_URL || '').trim();
const allowedOrigins = [envFrontend, 'http://localhost:5173', 'http://localhost:3000'].filter(Boolean);
console.log('[CORS] allowed origins:', allowedOrigins);

app.use(
  cors({
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow non-browser requests (curl, server-side) that have no origin
        if (!origin) return callback(null, true);
        // Exact match whitelist
        if (allowedOrigins.includes(origin)) return callback(null, true);
        // Allow any Vercel preview/domain under `*.vercel.app` to avoid
        // breaking when Vercel assigns a new auto-generated subdomain.
        try {
          const lc = origin.toLowerCase();
          if (lc.endsWith('.vercel.app')) return callback(null, true);
        } catch (e) {
          // ignore
        }
        return callback(new Error('Not allowed by CORS'));
      },
    credentials: true,
  })
);

app.use('/api/user/preferences', preferencesRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/reflections', reflectionRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/user', userRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/streak', streakRoutes);

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
