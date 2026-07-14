import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';
import { GitHubService } from './github.service.js';
import { AIService } from './ai.service.js';

export class AdminService {
  private githubService: GitHubService;
  private aiService: AIService;

  constructor() {
    this.githubService = new GitHubService();
    this.aiService = new AIService();
  }

  /** Approve an AI recommendation */
  async approveAnalysis(repositoryId: string, approvedBy = 'admin') {
    const analysis = await prisma.repositoryAnalysis.findUnique({
      where: { repositoryId },
    });
    if (!analysis) throw new AppError('Analysis not found', 404);

    const updated = await prisma.repositoryAnalysis.update({
      where: { repositoryId },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
      },
    });

    // If recommendation is "include", add to featured if not already there
    if (analysis.recommendation === 'include') {
      await prisma.featuredProject.upsert({
        where: { repositoryId },
        create: { repositoryId, displayOrder: 999 },
        update: {},
      });
    }

    return updated;
  }

  /** Reject an AI recommendation */
  async rejectAnalysis(repositoryId: string, note?: string) {
    return prisma.repositoryAnalysis.update({
      where: { repositoryId },
      data: {
        status: 'REJECTED',
        overrideNote: note ?? null,
        approvedAt: new Date(),
        approvedBy: 'admin',
      },
    });
  }

  /** Override with a custom decision */
  async overrideAnalysis(
    repositoryId: string,
    decision: 'include' | 'exclude' | 'maybe',
    note: string,
  ) {
    const analysis = await prisma.repositoryAnalysis.findUnique({
      where: { repositoryId },
    });
    if (!analysis) throw new AppError('Analysis not found', 404);

    // Record the override
    await prisma.override.create({
      data: {
        repositoryId,
        field: 'recommendation',
        oldValue: analysis.recommendation,
        newValue: decision,
        reason: note,
        createdBy: 'admin',
      },
    });

    const updated = await prisma.repositoryAnalysis.update({
      where: { repositoryId },
      data: {
        recommendation: decision,
        status: 'OVERRIDDEN',
        overrideNote: note,
        approvedBy: 'admin',
        approvedAt: new Date(),
      },
    });

    if (decision === 'include') {
      await prisma.featuredProject.upsert({
        where: { repositoryId },
        create: { repositoryId, displayOrder: 999 },
        update: {},
      });
    } else {
      await prisma.featuredProject.deleteMany({ where: { repositoryId } });
    }

    return updated;
  }

  /** Update featured project display settings */
  async updateFeaturedProject(
    repositoryId: string,
    data: {
      displayTitle?: string;
      displayDescription?: string;
      displayOrder?: number;
      pinned?: boolean;
      demoUrl?: string;
      blogPostUrl?: string;
      caseStudy?: string;
    },
  ) {
    return prisma.featuredProject.update({
      where: { repositoryId },
      data,
    });
  }

  /** Get all analyses pending review */
  async getPendingAnalyses() {
    return prisma.repositoryAnalysis.findMany({
      where: { status: 'PENDING' },
      include: { repository: true },
      orderBy: { aiScore: 'desc' },
    });
  }

  /** Trigger a full GitHub sync */
  async triggerSync() {
    return this.githubService.syncRepositories();
  }

  /** Trigger AI analysis for all unanalyzed repos */
  async triggerAnalysis() {
    return this.aiService.analyzeAll();
  }

  /** Trigger sync + analysis in sequence */
  async triggerFullPipeline() {
    const sync = await this.githubService.syncRepositories();
    const analysis = await this.aiService.analyzeAll();
    return { sync, analysis };
  }

  /** Get overview stats for admin dashboard */
  async getDashboardStats() {
    const [total, pending, approved, rejected, overridden] = await Promise.all([
      prisma.repository.count({ where: { isPrivate: false } }),
      prisma.repositoryAnalysis.count({ where: { status: 'PENDING' } }),
      prisma.repositoryAnalysis.count({ where: { status: 'APPROVED' } }),
      prisma.repositoryAnalysis.count({ where: { status: 'REJECTED' } }),
      prisma.repositoryAnalysis.count({ where: { status: 'OVERRIDDEN' } }),
    ]);
    return { total, pending, approved, rejected, overridden };
  }

  /** Permanently delete a repository and all its analysis/featured data */
  async deleteRepository(repositoryId: string) {
    const repo = await prisma.repository.findUnique({ where: { id: repositoryId } });
    if (!repo) throw new AppError('Repository not found', 404);
    // Cascade deletes analysis + featured via schema onDelete: Cascade
    await prisma.repository.delete({ where: { id: repositoryId } });
    return { deleted: repo.fullName };
  }

  /** Manually add an external GitHub repo (outside the configured username) */
  async addExternalProject(githubUrl: string) {
    // Extract owner/repo from URL like https://github.com/owner/repo
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/.*)?$/);
    if (!match) throw new AppError('Invalid GitHub URL', 400);
    const fullName = `${match[1]}/${match[2]}`;

    const details = await this.githubService.fetchRepoDetails(fullName);
    if (!details.repo) throw new AppError(`Could not fetch repo: ${fullName}`, 404);

    const repo = details.repo;
    const saved = await prisma.repository.upsert({
      where: { githubId: repo.id },
      create: {
        githubId: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        homepage: repo.homepage,
        language: repo.language,
        languages: details.languages,
        topics: repo.topics,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        openIssues: repo.open_issues_count,
        size: repo.size,
        isPrivate: false,
        isFork: repo.fork,
        isArchived: repo.archived,
        defaultBranch: repo.default_branch,
        license: repo.license?.spdx_id ?? null,
        readme: details.readme,
        commitCount: details.commitCount,
        createdAt: new Date(repo.created_at),
        updatedAt: new Date(repo.updated_at),
        pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
      },
      update: {
        description: repo.description,
        language: repo.language,
        languages: details.languages,
        topics: repo.topics,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        syncedAt: new Date(),
      },
    });
    return saved;
  }
}
