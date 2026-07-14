import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';

import { errorHandler } from './middleware/error.js';
import { githubRouter } from './routes/github.js';
import { aiRouter } from './routes/ai.js';
import { portfolioRouter } from './routes/portfolio.js';
import { adminRouter } from './routes/admin.js';
import { analyticsRouter } from './routes/analytics.js';
import { AdminService } from './services/admin.service.js';

const app = express();
const PORT = process.env.PORT ?? 4000;

// Security
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global rate limiter
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/github', githubRouter);
app.use('/api/ai', aiRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/admin', adminRouter);
app.use('/api/analytics', analyticsRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Portfolio backend running at http://localhost:${PORT}`);
    schedulePipeline();
  });
}

// ─── Scheduled pipeline ──────────────────────────────────────────────────────
// Runs every 6 hours. Smart diffing in GitHub & AI services means only
// repos that actually changed since last run incur real API calls.

const INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

function schedulePipeline() {
  const adminSvc = new AdminService();

  async function run() {
    console.log('⏰ [scheduler] Starting scheduled pipeline...');
    try {
      const result = await adminSvc.triggerFullPipeline();
      console.log('✅ [scheduler] Pipeline complete:', JSON.stringify(result));
    } catch (err) {
      console.error('❌ [scheduler] Pipeline failed:', err);
    }
  }

  // First run after 30s to let the server settle
  setTimeout(run, 30_000);

  // Then every 6 hours
  setInterval(run, INTERVAL_MS);

  console.log(`🕐 Scheduled pipeline: first run in 30s, then every 6 hours`);
}

export default app;
