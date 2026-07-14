import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AIService } from '../services/ai.service.js';
import { requireAdmin } from '../middleware/auth.js';
import { rateLimit } from 'express-rate-limit';

export const aiRouter = Router();
const svc = new AIService();

// Tighter rate limit for AI endpoints (Groq API costs)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'AI rate limit exceeded. Please wait a minute.' },
});

// POST /api/ai/analyze/:repositoryId — analyze a single repo (admin only)
aiRouter.post(
  '/analyze/:repositoryId',
  requireAdmin,
  aiLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await svc.analyzeRepository(req.params.repositoryId);
      res.json({ data: result, message: 'Analysis complete — pending human approval' });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/ai/analyze-all — analyze all unanalyzed repos (admin only)
aiRouter.post(
  '/analyze-all',
  requireAdmin,
  aiLimiter,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await svc.analyzeAll();
      res.json({ data: result, message: 'Batch analysis complete' });
    } catch (err) {
      next(err);
    }
  },
);
