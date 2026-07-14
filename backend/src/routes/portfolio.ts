import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PortfolioService } from '../services/portfolio.service.js';

export const portfolioRouter = Router();
const svc = new PortfolioService();

// GET /api/portfolio/featured
portfolioRouter.get('/featured', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await svc.getFeaturedProjects();
    res.json({ data: projects });
  } catch (err) {
    next(err);
  }
});

// GET /api/portfolio/repositories
portfolioRouter.get('/repositories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string ?? '1', 10);
    const limit = Math.min(parseInt(req.query.limit as string ?? '20', 10), 100);
    const result = await svc.getAllRepositories(page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/portfolio/repositories/approved
portfolioRouter.get('/repositories/approved', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const repos = await svc.getApprovedRepositories();
    res.json({ data: repos });
  } catch (err) {
    next(err);
  }
});

// GET /api/portfolio/repositories/:owner/:repo
portfolioRouter.get('/repositories/:owner/:repo', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fullName = `${req.params.owner}/${req.params.repo}`;
    const repo = await svc.getRepository(fullName);
    res.json({ data: repo });
  } catch (err) {
    next(err);
  }
});

// GET /api/portfolio/stats
portfolioRouter.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await svc.getStats();
    res.json({ data: stats });
  } catch (err) {
    next(err);
  }
});
