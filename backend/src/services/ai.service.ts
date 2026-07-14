import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';
import { GitHubService } from './github.service.js';

const PROMPT_VERSION = 'v2';

// Doc-only / markup languages that carry no code weight
const DOC_LANGUAGES = new Set([
  'Markdown', 'Text', 'reStructuredText', 'AsciiDoc', 'HTML', 'CSS',
]);

interface AnalysisInput {
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  languages: Record<string, number>;
  topics: string[];
  stars: number;
  forks: number;
  openIssues: number;
  commitCount: number;
  size: number;
  readme: string | null;
  fileTree: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalysisResult {
  aiScore: number;
  complexityScore: number;
  impactScore: number;
  uniquenessScore: number;
  recommendation: 'include' | 'exclude' | 'maybe';
  reasoning: string;
  highlights: string[];
  tags: string[];
}

/** True if repo has at least one non-doc language */
function hasCodeLanguages(languages: Record<string, number>): boolean {
  return Object.keys(languages).some(l => !DOC_LANGUAGES.has(l));
}

function buildPrompt(repo: AnalysisInput): string {
  const readmeSnippet = repo.readme
    ? repo.readme.slice(0, 3000)
    : 'No README available.';

  const languageList = Object.entries(repo.languages)
    .sort(([, a], [, b]) => b - a)
    .map(([lang, bytes]) => `${lang}: ${bytes} bytes`)
    .join(', ');

  const fileTreeSection = repo.fileTree.length > 0
    ? repo.fileTree.join('\n')
    : 'Unable to fetch file tree.';

  return `You are an expert software engineering portfolio curator. Analyze the following GitHub repository and determine if it should be featured in a developer portfolio.

## Repository: ${repo.fullName}

**Description:** ${repo.description ?? 'None'}
**Primary Language:** ${repo.language ?? 'Unknown'}
**Languages (bytes):** ${languageList || 'None'}
**Topics:** ${repo.topics.join(', ') || 'None'}
**Stars:** ${repo.stars} | **Forks:** ${repo.forks} | **Open Issues:** ${repo.openIssues}
**Total Commits:** ${repo.commitCount}
**Size:** ${repo.size} KB
**Created:** ${repo.createdAt.toISOString().slice(0, 10)}
**Last Updated:** ${repo.updatedAt.toISOString().slice(0, 10)}

## Root File Tree
\`\`\`
${fileTreeSection}
\`\`\`

## README (truncated to 3000 chars)
${readmeSnippet}

## Task
Analyze this repository and return a JSON object with EXACTLY this shape (no extra fields, no markdown code blocks):
{
  "aiScore": <number 0-100, overall portfolio worthiness>,
  "complexityScore": <number 0-100, technical depth and sophistication>,
  "impactScore": <number 0-100, real-world usefulness and community value>,
  "uniquenessScore": <number 0-100, originality and novelty>,
  "recommendation": <"include" | "exclude" | "maybe">,
  "reasoning": <2-3 sentence explanation of your decision>,
  "highlights": [<1-4 specific selling points as short strings>],
  "tags": [<3-6 technical domain tags e.g. "machine-learning", "distributed-systems", "cli-tool">]
}

## Scoring guidance

**HARD EXCLUSION rules — assign aiScore < 20 and "exclude" immediately if ANY apply:**
- Contains only Markdown, HTML, CSS, or plain text — no real programming language present.
- Only or primarily plain HTML/CSS/vanilla JavaScript with no framework, build system, or logic (landing pages, CSS demos, tutorials).
- Only contains a README or docs — no source code files visible in the file tree.
- College assignment, boilerplate clone, or tutorial follow-along with no original contribution.
- A "planning" or "roadmap" repo (title/description/tree indicates only notes/ideas).

**Normal scoring:**
- aiScore >= 75 → "include"
- aiScore 50-74 → "maybe"
- aiScore < 50 → "exclude"

Pay close attention to the **Root File Tree** — it is the ground truth for what code exists. Use the README for context and quality signals. A project must demonstrate real engineering judgment — architecture decisions, non-trivial logic, system design, or meaningful tooling — to score above 50.`;
}

export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: string;
  private github: GitHubService;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';
    this.github = new GitHubService();
  }

  async analyzeRepository(repositoryId: string): Promise<AnalysisResult> {
    const repo = await prisma.repository.findUnique({
      where: { id: repositoryId },
    });

    if (!repo) throw new AppError('Repository not found', 404);

    // Fetch the root file tree from GitHub for real content context
    const fileTree = await this.github.fetchRootFileTree(repo.fullName, repo.defaultBranch);

    const prompt = buildPrompt({
      name: repo.name,
      fullName: repo.fullName,
      description: repo.description,
      language: repo.language,
      languages: repo.languages as Record<string, number>,
      topics: repo.topics,
      stars: repo.stars,
      forks: repo.forks,
      openIssues: repo.openIssues,
      commitCount: repo.commitCount,
      size: repo.size,
      readme: repo.readme,
      fileTree,
      createdAt: repo.createdAt,
      updatedAt: repo.updatedAt,
    });

    const geminiModel = this.genAI.getGenerativeModel({
      model: this.model,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
      },
    });

    const result = await geminiModel.generateContent(prompt);
    const rawContent = result.response.text();

    if (!rawContent) throw new AppError('Empty response from AI', 500);

    let parsed: AnalysisResult;
    try {
      parsed = JSON.parse(rawContent) as AnalysisResult;
    } catch {
      throw new AppError('Malformed JSON from AI', 500);
    }

    this.validateAnalysisResult(parsed);

    // Persist — always PENDING until human approves
    await prisma.repositoryAnalysis.upsert({
      where: { repositoryId },
      create: {
        repositoryId,
        aiScore: parsed.aiScore,
        complexityScore: parsed.complexityScore,
        impactScore: parsed.impactScore,
        uniquenessScore: parsed.uniquenessScore,
        recommendation: parsed.recommendation,
        reasoning: parsed.reasoning,
        highlights: parsed.highlights,
        tags: parsed.tags,
        status: 'PENDING',
        rawResponse: JSON.parse(rawContent) as object,
        modelUsed: this.model,
        promptVersion: PROMPT_VERSION,
      },
      update: {
        aiScore: parsed.aiScore,
        complexityScore: parsed.complexityScore,
        impactScore: parsed.impactScore,
        uniquenessScore: parsed.uniquenessScore,
        recommendation: parsed.recommendation,
        reasoning: parsed.reasoning,
        highlights: parsed.highlights,
        tags: parsed.tags,
        status: 'PENDING',
        rawResponse: JSON.parse(rawContent) as object,
        modelUsed: this.model,
        promptVersion: PROMPT_VERSION,
        approvedBy: null,
        approvedAt: null,
        overrideNote: null,
      },
    });

    return parsed;
  }

  /**
   * Analyze repos that need it, with pre-filtering and smart change detection.
   *
   * Pre-filters (skipped before touching AI):
   *   - Fork
   *   - No README
   *   - No code languages (markdown/text/doc only)
   *
   * Smart skip:
   *   - Already has an analysis AND repo hasn't been pushed since that analysis ran
   */
  async analyzeAll(): Promise<{ analyzed: number; failed: number; skipped: number }> {
    const repos = await prisma.repository.findMany({
      where: { isPrivate: false, isFork: false },
      include: { analysis: true },
    });

    let analyzed = 0;
    let failed = 0;
    let skipped = 0;

    for (const repo of repos) {
      const langs = repo.languages as Record<string, number>;

      // ── Pre-flight filters ─────────────────────────────────────
      if (repo.isFork) {
        console.log(`[ai] skip fork: ${repo.fullName}`);
        skipped++; continue;
      }
      if (!repo.readme) {
        console.log(`[ai] skip no-readme: ${repo.fullName}`);
        skipped++; continue;
      }
      if (!hasCodeLanguages(langs)) {
        console.log(`[ai] skip doc-only: ${repo.fullName}`);
        skipped++; continue;
      }

      // ── Smart change detection ─────────────────────────────────
      // Skip if the last analysis is newer than the repo's last push
      if (repo.analysis && repo.pushedAt) {
        if (repo.analysis.updatedAt >= repo.pushedAt) {
          console.log(`[ai] skip up-to-date: ${repo.fullName}`);
          skipped++; continue;
        }
      } else if (repo.analysis && !repo.pushedAt) {
        // No pushed_at info and already analyzed — skip to be safe
        skipped++; continue;
      }

      try {
        await this.analyzeRepository(repo.id);
        analyzed++;
        // Polite delay between AI calls
        await new Promise(resolve => setTimeout(resolve, 600));
      } catch (err) {
        console.error(`[ai] failed: ${repo.fullName}:`, err);
        failed++;
      }
    }

    return { analyzed, failed, skipped };
  }

  private validateAnalysisResult(result: unknown): asserts result is AnalysisResult {
    const r = result as Record<string, unknown>;
    const required = [
      'aiScore', 'complexityScore', 'impactScore', 'uniquenessScore',
      'recommendation', 'reasoning', 'highlights', 'tags',
    ];
    for (const key of required) {
      if (!(key in r)) throw new AppError(`AI response missing field: ${key}`, 500);
    }
    if (!['include', 'exclude', 'maybe'].includes(r.recommendation as string)) {
      throw new AppError('Invalid recommendation value from AI', 500);
    }
  }
}
