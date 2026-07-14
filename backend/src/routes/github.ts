import { Router, Request, Response, NextFunction } from 'express';
import { GitHubService } from '../services/github.service.js';
import { requireAdmin } from '../middleware/auth.js';

export const githubRouter = Router();
const svc = new GitHubService();

// GET /api/github/repos — list synced repositories (public)
githubRouter.get('/repos', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const repos = await svc.fetchAllRepos();
    res.json({ data: repos, count: repos.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/github/repos/:owner/:repo — fetch details (admin only)
githubRouter.get('/repos/:owner/:repo', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fullName = `${req.params.owner}/${req.params.repo}`;
    const details = await svc.fetchRepoDetails(fullName);
    res.json({ data: details });
  } catch (err) {
    next(err);
  }
});
