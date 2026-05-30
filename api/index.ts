import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '../routes/auth';
import taskRoutes from '../routes/tasks';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Simple health probe
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler middleware to catch any unhandled routing/middleware faults under Vercel
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Vercel Global Error Handler]:', err);
  res.status(500).json({
    message: err.message || 'An unexpected internal server error occurred.'
  });
});

// Since Vercel expects a default exported handler or listener in api/index.ts:
export default app;
