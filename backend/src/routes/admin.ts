import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AdminService } from '../services/admin.service.js';
import { requireAdmin } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';

export const adminRouter = Router();

// All admin routes require the admin secret header
adminRouter.use(requireAdmin);

const svc = new AdminService();

// GET /api/admin/stats
adminRouter.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await svc.getDashboardStats();
    res.json({ data: stats });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/pending
adminRouter.get('/pending', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const pending = await svc.getPendingAnalyses();
    res.json({ data: pending });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/approve/:repositoryId
adminRouter.post('/approve/:repositoryId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await svc.approveAnalysis(req.params.repositoryId);
    res.json({ data: result, message: 'Analysis approved' });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/reject/:repositoryId
const rejectSchema = z.object({
  note: z.string().optional(),
});

adminRouter.post('/reject/:repositoryId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { note } = rejectSchema.parse(req.body);
    const result = await svc.rejectAnalysis(req.params.repositoryId, note);
    res.json({ data: result, message: 'Analysis rejected' });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/override/:repositoryId
const overrideSchema = z.object({
  decision: z.enum(['include', 'exclude', 'maybe']),
  note: z.string().min(1, 'Override note is required'),
});

adminRouter.post('/override/:repositoryId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { decision, note } = overrideSchema.parse(req.body);
    const result = await svc.overrideAnalysis(req.params.repositoryId, decision, note);
    res.json({ data: result, message: 'Analysis overridden' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/featured/:repositoryId
const featuredUpdateSchema = z.object({
  displayTitle: z.string().optional(),
  displayDescription: z.string().optional(),
  displayOrder: z.number().int().optional(),
  pinned: z.boolean().optional(),
  demoUrl: z.string().url().optional().or(z.literal('')),
  blogPostUrl: z.string().url().optional().or(z.literal('')),
  caseStudy: z.string().optional(),
});

adminRouter.patch('/featured/:repositoryId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = featuredUpdateSchema.parse(req.body);
    const result = await svc.updateFeaturedProject(req.params.repositoryId, data);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/pipeline/sync
adminRouter.post('/pipeline/sync', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await svc.triggerSync();
    res.json({ data: result, message: 'Sync complete' });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/pipeline/analyze
adminRouter.post('/pipeline/analyze', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await svc.triggerAnalysis();
    res.json({ data: result, message: 'Analysis complete' });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/pipeline/full
adminRouter.post('/pipeline/full', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await svc.triggerFullPipeline();
    res.json({ data: result, message: 'Full pipeline complete' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/repository/:repositoryId
adminRouter.delete('/repository/:repositoryId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await svc.deleteRepository(req.params.repositoryId);
    res.json({ data: result, message: `Deleted ${result.deleted}` });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/repository/external
const externalSchema = z.object({
  githubUrl: z.string().url().includes('github.com'),
});

adminRouter.post('/repository/external', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { githubUrl } = externalSchema.parse(req.body);
    const result = await svc.addExternalProject(githubUrl);
    res.status(201).json({ data: result, message: `Added ${result.fullName}` });
  } catch (err) {
    next(err);
  }
});
