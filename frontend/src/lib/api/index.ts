import { PUBLIC_API_URL } from '$env/static/public';

const BASE = PUBLIC_API_URL || '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
  return json;
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

export async function getFeaturedProjects() {
  const r = await request<{ data: FeaturedProject[] }>('/portfolio/featured');
  return r.data;
}

export async function getApprovedRepositories() {
  const r = await request<{ data: Repository[] }>('/portfolio/repositories/approved');
  return r.data;
}

export async function getRepository(owner: string, repo: string) {
  const r = await request<{ data: Repository }>(`/portfolio/repositories/${owner}/${repo}`);
  return r.data;
}

export async function getStats() {
  const r = await request<{ data: PortfolioStats }>('/portfolio/stats');
  return r.data;
}

export async function getAllRepositories(page = 1, limit = 20) {
  return request<{ total: number; page: number; limit: number; repos: Repository[] }>(
    `/portfolio/repositories?page=${page}&limit=${limit}`,
  );
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function getLatestSnapshot() {
  const r = await request<{ data: AnalyticsSnapshot }>('/analytics/snapshot');
  return r.data;
}

export async function getSnapshots() {
  const r = await request<{ data: AnalyticsSnapshot[] }>('/analytics/snapshots');
  return r.data;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

function adminRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const secret = localStorage.getItem('adminSecret') ?? '';
  return request<T>(path, {
    ...options,
    headers: { 'x-admin-secret': secret, ...options?.headers },
  });
}

export async function getAdminStats() {
  const r = await adminRequest<{ data: AdminStats }>('/admin/stats');
  return r.data;
}

export async function getPendingAnalyses() {
  const r = await adminRequest<{ data: RepositoryAnalysis[] }>('/admin/pending');
  return r.data;
}

export async function approveAnalysis(repositoryId: string) {
  return adminRequest(`/admin/approve/${repositoryId}`, { method: 'POST' });
}

export async function rejectAnalysis(repositoryId: string, note?: string) {
  return adminRequest(`/admin/reject/${repositoryId}`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  });
}

export async function overrideAnalysis(
  repositoryId: string,
  decision: 'include' | 'exclude' | 'maybe',
  note: string,
) {
  return adminRequest(`/admin/override/${repositoryId}`, {
    method: 'POST',
    body: JSON.stringify({ decision, note }),
  });
}

export async function triggerSync() {
  return adminRequest('/admin/pipeline/sync', { method: 'POST' });
}

export async function triggerAnalysis() {
  return adminRequest('/admin/pipeline/analyze', { method: 'POST' });
}

export async function triggerFullPipeline() {
  return adminRequest('/admin/pipeline/full', { method: 'POST' });
}

export async function deleteRepository(repositoryId: string) {
  return adminRequest(`/admin/repository/${repositoryId}`, { method: 'DELETE' });
}

export async function addExternalProject(githubUrl: string) {
  return adminRequest('/admin/repository/external', {
    method: 'POST',
    body: JSON.stringify({ githubUrl }),
  });
}

export async function updateFeaturedProject(repositoryId: string, data: Partial<FeaturedProject>) {
  return adminRequest(`/admin/featured/${repositoryId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Repository {
  id: string;
  githubId: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  languages: Record<string, number>;
  topics: string[];
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  size: number;
  isPrivate: boolean;
  isFork: boolean;
  isArchived: boolean;
  license: string | null;
  readme: string | null;
  commitCount: number;
  createdAt: string;
  updatedAt: string;
  pushedAt: string | null;
  syncedAt: string;
  analysis: RepositoryAnalysis | null;
  featuredProject: FeaturedProject | null;
}

export interface RepositoryAnalysis {
  id: string;
  repositoryId: string;
  aiScore: number;
  complexityScore: number;
  impactScore: number;
  uniquenessScore: number;
  recommendation: 'include' | 'exclude' | 'maybe';
  reasoning: string;
  highlights: string[];
  tags: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'OVERRIDDEN';
  approvedBy: string | null;
  approvedAt: string | null;
  overrideNote: string | null;
  modelUsed: string;
  createdAt: string;
  updatedAt: string;
  repository?: Repository;
}

export interface FeaturedProject {
  id: string;
  repositoryId: string;
  displayTitle: string | null;
  displayDescription: string | null;
  displayOrder: number;
  pinned: boolean;
  demoUrl: string | null;
  blogPostUrl: string | null;
  caseStudy: string | null;
  createdAt: string;
  updatedAt: string;
  repository?: Repository;
}

export interface PortfolioStats {
  totalRepos: number;
  totalStars: number;
  totalLanguages: number;
  topLanguages: { lang: string; count: number }[];
  featuredCount: number;
}

export interface AdminStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  overridden: number;
}

export interface AnalyticsSnapshot {
  id: string;
  snapshotAt: string;
  totalRepos: number;
  featuredCount: number;
  totalStars: number;
  totalForks: number;
  languages: Record<string, number>;
  topTopics: Record<string, number>;
}
