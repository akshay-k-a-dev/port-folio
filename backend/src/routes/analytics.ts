import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';

export const analyticsRouter = Router();

// GET /api/analytics/snapshot — latest snapshot (auto-creates one from live data if none exists)
analyticsRouter.get('/snapshot', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    let snapshot = await prisma.analyticsSnapshot.findFirst({
      orderBy: { snapshotAt: 'desc' },
    });

    // Auto-generate from live DB data if no snapshot exists yet
    if (!snapshot) {
      const [totalRepos, featuredCount, starSum, langs, topicRows] = await Promise.all([
        prisma.repository.count({ where: { isPrivate: false, isFork: false } }),
        prisma.featuredProject.count(),
        prisma.repository.aggregate({ where: { isPrivate: false }, _sum: { stars: true, forks: true } }),
        prisma.repository.findMany({ where: { isPrivate: false }, select: { language: true } }),
        prisma.repository.findMany({ where: { isPrivate: false }, select: { topics: true } }),
      ]);

      const languages = langs.reduce<Record<string, number>>((acc, r) => {
        if (r.language) acc[r.language] = (acc[r.language] ?? 0) + 1;
        return acc;
      }, {});

      const topicMap = topicRows.reduce<Record<string, number>>((acc, r) => {
        for (const t of r.topics) acc[t] = (acc[t] ?? 0) + 1;
        return acc;
      }, {});
      const topTopics = Object.entries(topicMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .reduce<Record<string, number>>((acc, [k, v]) => { acc[k] = v; return acc; }, {});

      snapshot = await prisma.analyticsSnapshot.create({
        data: {
          totalRepos,
          featuredCount,
          totalStars: starSum._sum.stars ?? 0,
          totalForks: starSum._sum.forks ?? 0,
          languages,
          topTopics,
        },
      });
    }

    res.json({ data: snapshot });
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/snapshots — last 30 snapshots for trend charts
analyticsRouter.get('/snapshots', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const snapshots = await prisma.analyticsSnapshot.findMany({
      orderBy: { snapshotAt: 'desc' },
      take: 30,
    });
    res.json({ data: snapshots.reverse() });
  } catch (err) {
    next(err);
  }
});

// POST /api/analytics/snapshot — create a new snapshot (internal, called after sync)
analyticsRouter.post('/snapshot', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalRepos, featuredCount, starSum, langs, topicRows] = await Promise.all([
      prisma.repository.count({ where: { isPrivate: false, isFork: false } }),
      prisma.featuredProject.count(),
      prisma.repository.aggregate({ where: { isPrivate: false }, _sum: { stars: true, forks: true } }),
      prisma.repository.findMany({ where: { isPrivate: false }, select: { language: true } }),
      prisma.repository.findMany({ where: { isPrivate: false }, select: { topics: true } }),
    ]);

    const languages = langs.reduce<Record<string, number>>((acc, r) => {
      if (r.language) acc[r.language] = (acc[r.language] ?? 0) + 1;
      return acc;
    }, {});

    const topicMap = topicRows.reduce<Record<string, number>>((acc, r) => {
      for (const t of r.topics) acc[t] = (acc[t] ?? 0) + 1;
      return acc;
    }, {});
    const topTopics = Object.entries(topicMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .reduce<Record<string, number>>((acc, [k, v]) => { acc[k] = v; return acc; }, {});

    const snapshot = await prisma.analyticsSnapshot.create({
      data: {
        totalRepos,
        featuredCount,
        totalStars: starSum._sum.stars ?? 0,
        totalForks: starSum._sum.forks ?? 0,
        languages,
        topTopics,
      },
    });

    res.status(201).json({ data: snapshot });
  } catch (err) {
    next(err);
  }
});
