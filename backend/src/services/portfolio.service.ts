import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';

export class PortfolioService {
  /** Get all featured projects with full details */
  async getFeaturedProjects() {
    return prisma.featuredProject.findMany({
      orderBy: [{ pinned: 'desc' }, { displayOrder: 'asc' }],
      include: {
        repository: {
          include: { analysis: true },
        },
      },
    });
  }

  /** Get all repositories that have an APPROVED analysis */
  async getApprovedRepositories() {
    return prisma.repository.findMany({
      where: {
        analysis: { status: 'APPROVED', recommendation: 'include' },
        isPrivate: false,
        isFork: false,
      },
      include: { analysis: true, featuredProject: true },
      orderBy: { stars: 'desc' },
    });
  }

  /** Get a single repository by full name */
  async getRepository(fullName: string) {
    const repo = await prisma.repository.findUnique({
      where: { fullName },
      include: { analysis: true, featuredProject: true },
    });
    if (!repo) throw new AppError('Repository not found', 404);
    return repo;
  }

  /** Get all repositories (for admin view) */
  async getAllRepositories(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [total, repos] = await Promise.all([
      prisma.repository.count({ where: { isPrivate: false } }),
      prisma.repository.findMany({
        where: { isPrivate: false },
        include: { analysis: true, featuredProject: true },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);
    return { total, page, limit, repos };
  }

  /** Get portfolio stats for the home page */
  async getStats() {
    const [totalRepos, totalStars, languages, featured] = await Promise.all([
      prisma.repository.count({ where: { isPrivate: false, isFork: false } }),
      prisma.repository.aggregate({
        where: { isPrivate: false },
        _sum: { stars: true },
      }),
      prisma.repository.findMany({
        where: { isPrivate: false },
        select: { language: true },
      }),
      prisma.featuredProject.count(),
    ]);

    const languageCounts = languages.reduce<Record<string, number>>((acc, r) => {
      if (r.language) acc[r.language] = (acc[r.language] ?? 0) + 1;
      return acc;
    }, {});

    return {
      totalRepos,
      totalStars: totalStars._sum.stars ?? 0,
      totalLanguages: Object.keys(languageCounts).length,
      topLanguages: Object.entries(languageCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([lang, count]) => ({ lang, count })),
      featuredCount: featured,
    };
  }
}
