import { Octokit } from '@octokit/rest';
import { graphql } from '@octokit/graphql';
import { prisma } from '../lib/prisma.js';
import { CacheService } from './cache.service.js';

export interface RawRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  size: number;
  private: boolean;
  fork: boolean;
  archived: boolean;
  default_branch: string;
  license: { spdx_id: string } | null;
  created_at: string;
  updated_at: string;
  pushed_at: string | null;
}

export class GitHubService {
  private octokit: Octokit;
  private graphqlWithAuth: typeof graphql;
  private username: string;
  private cache: CacheService;

  constructor() {
    const token = process.env.GITHUB_TOKEN;
    const username = process.env.GITHUB_USERNAME;

    if (!token) throw new Error('GITHUB_TOKEN is not set');
    if (!username) throw new Error('GITHUB_USERNAME is not set');

    this.username = username;
    this.cache = new CacheService();

    this.octokit = new Octokit({ auth: token });
    this.graphqlWithAuth = graphql.defaults({
      headers: { authorization: `token ${token}` },
    });
  }

  /** Fetch all public repos for the configured user */
  async fetchAllRepos(): Promise<RawRepo[]> {
    const cacheKey = `github:repos:${this.username}`;
    const cached = await this.cache.get<RawRepo[]>(cacheKey);
    if (cached) return cached;

    const repos: RawRepo[] = [];
    let page = 1;

    while (true) {
      const { data } = await this.octokit.repos.listForUser({
        username: this.username,
        type: 'owner',
        sort: 'updated',
        per_page: 100,
        page,
      });

      if (data.length === 0) break;
      repos.push(...(data as unknown as RawRepo[]));
      if (data.length < 100) break;
      page++;
    }

    await this.cache.set(cacheKey, repos, 3600); // 1 hour TTL
    return repos;
  }

  /** Fetch detailed repo data including README and language breakdown */
  async fetchRepoDetails(fullName: string): Promise<{
    repo: RawRepo;
    readme: string | null;
    languages: Record<string, number>;
    commitCount: number;
  }> {
    const cacheKey = `github:repo-detail:${fullName}`;
    const cached = await this.cache.get<{
      repo: RawRepo;
      readme: string | null;
      languages: Record<string, number>;
      commitCount: number;
    }>(cacheKey);
    if (cached) return cached;

    const [owner, repo] = fullName.split('/');

    // Fetch in parallel
    const [repoData, languagesData, readmeData, commitData] = await Promise.allSettled([
      this.octokit.repos.get({ owner, repo }),
      this.octokit.repos.listLanguages({ owner, repo }),
      this.octokit.repos.getReadme({ owner, repo }).catch(() => null),
      this.octokit.repos.getCommitActivityStats({ owner, repo }),
    ]);

    const repoInfo = repoData.status === 'fulfilled' ? repoData.value.data : null;
    const languages = languagesData.status === 'fulfilled' ? languagesData.value.data : {};

    let readme: string | null = null;
    if (readmeData.status === 'fulfilled' && readmeData.value) {
      const content = readmeData.value.data.content;
      readme = Buffer.from(content, 'base64').toString('utf-8');
    }

    let commitCount = 0;
    if (commitData.status === 'fulfilled' && Array.isArray(commitData.value.data)) {
      commitCount = commitData.value.data.reduce((sum, week) => sum + (week.total ?? 0), 0);
    }

    const result = {
      repo: repoInfo as unknown as RawRepo,
      readme: readme ? readme.slice(0, 20000) : null, // cap at 20k chars
      languages: languages as Record<string, number>,
      commitCount,
    };

    await this.cache.set(cacheKey, result, 1800); // 30 min TTL
    return result;
  }

  /**
   * Fetch the root-level file/directory tree of a repo.
   * Returns an array of filenames like ["src/", "package.json", "README.md"]
   * Used by the AI to understand project structure without fetching full code.
   */
  async fetchRootFileTree(fullName: string, branch: string): Promise<string[]> {
    const cacheKey = `github:tree:${fullName}:${branch}`;
    const cached = await this.cache.get<string[]>(cacheKey);
    if (cached) return cached;

    const [owner, repo] = fullName.split('/');
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path: '',
        ref: branch,
      });

      const entries = Array.isArray(data)
        ? data.map(f => f.type === 'dir' ? `${f.name}/` : f.name)
        : [];

      await this.cache.set(cacheKey, entries, 3600); // 1 hour TTL
      return entries;
    } catch {
      return [];
    }
  }

  /**
   * Sync all public, non-fork repos to the database.
   * Smart diff: if pushed_at hasn't changed, only refresh star/fork counts
   * instead of re-fetching full details (README, languages, commits).
   */
  async syncRepositories(): Promise<{ synced: number; skipped: number; unchanged: number }> {
    const repos = await this.fetchAllRepos();

    // Batch-fetch existing pushedAt timestamps to avoid N+1
    const existingRepos = await prisma.repository.findMany({
      select: { githubId: true, pushedAt: true },
    });
    const existingMap = new Map(existingRepos.map(r => [r.githubId, r.pushedAt]));

    let synced = 0;
    let skipped = 0;
    let unchanged = 0;

    for (const repo of repos) {
      if (repo.private || repo.fork) {
        skipped++;
        continue;
      }

      try {
        const existingPushedAt = existingMap.get(repo.id);
        const githubPushedAt = repo.pushed_at ? new Date(repo.pushed_at) : null;

        // If pushed_at is unchanged, do a lightweight stats-only update
        if (
          existingPushedAt &&
          githubPushedAt &&
          existingPushedAt.getTime() === githubPushedAt.getTime()
        ) {
          await prisma.repository.update({
            where: { githubId: repo.id },
            data: {
              stars: repo.stargazers_count,
              forks: repo.forks_count,
              watchers: repo.watchers_count,
              openIssues: repo.open_issues_count,
              syncedAt: new Date(),
            },
          });
          unchanged++;
          continue;
        }

        // Repo has been updated — fetch full details
        const details = await this.fetchRepoDetails(repo.full_name);

        await prisma.repository.upsert({
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
            isPrivate: repo.private,
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
            homepage: repo.homepage,
            language: repo.language,
            languages: details.languages,
            topics: repo.topics,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            watchers: repo.watchers_count,
            openIssues: repo.open_issues_count,
            size: repo.size,
            isArchived: repo.archived,
            readme: details.readme,
            commitCount: details.commitCount,
            updatedAt: new Date(repo.updated_at),
            pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
            syncedAt: new Date(),
          },
        });
        synced++;
      } catch (err) {
        console.error(`Failed to sync ${repo.full_name}:`, err);
        skipped++;
      }
    }

    return { synced, skipped, unchanged };
  }
}
