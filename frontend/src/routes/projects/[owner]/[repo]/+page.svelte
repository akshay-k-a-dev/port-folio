<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { getRepository } from '$api';
  import type { Repository } from '$api';

  let repo: Repository | null = null;
  let error = '';

  $: params = $page.params;

  onMount(async () => {
    try {
      const owner = params.owner ?? '';
      const repoName = params.repo ?? '';
      repo = await getRepository(owner, repoName);
    } catch (e) {
      error = (e as Error).message;
    }
  });

  $: topLanguages = repo
    ? Object.entries(repo.languages as Record<string, number>)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
    : [];
</script>

<svelte:head>
  <title>{repo?.name ?? 'Project'} — Portfolio</title>
  <meta name="description" content={repo?.description ?? ''} />
</svelte:head>

<div class="container pt-32 pb-24">
  {#if error}
    <p class="text-red-400">{error}</p>
  {:else if !repo}
    <div class="animate-pulse space-y-4">
      <div class="h-8 bg-surface-raised rounded w-48" />
      <div class="h-16 bg-surface-raised rounded" />
    </div>
  {:else}
    <!-- Header -->
    <div class="mb-12">
      <a href="/projects" class="text-ink-400 hover:text-ink-200 font-mono text-sm mb-6 inline-block transition-colors">← Back</a>
      <div class="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p class="section-label mb-3">{repo.language ?? 'Repository'}</p>
          <h1 class="font-display text-5xl md:text-6xl mb-4">{repo.name}</h1>
          {#if repo.description}
            <p class="text-ink-300 text-xl max-w-2xl">{repo.description}</p>
          {/if}
        </div>
        <div class="flex gap-3 mt-2">
          <a href={repo.url} target="_blank" rel="noopener" class="btn-outline">
            GitHub →
          </a>
          {#if repo.featuredProject?.demoUrl}
            <a href={repo.featuredProject.demoUrl} target="_blank" rel="noopener" class="btn-primary">
              Live Demo
            </a>
          {/if}
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main content -->
      <div class="lg:col-span-2 space-y-8">
        <!-- AI Analysis -->
        {#if repo.analysis}
          <div class="card p-6 border-accent-500/20 bg-accent-500/5">
            <p class="section-label mb-4">AI Analysis</p>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {#each [
                { label: 'Overall', value: repo.analysis.aiScore },
                { label: 'Complexity', value: repo.analysis.complexityScore },
                { label: 'Impact', value: repo.analysis.impactScore },
                { label: 'Uniqueness', value: repo.analysis.uniquenessScore },
              ] as metric}
                <div class="text-center">
                  <div class="text-3xl font-display font-bold text-accent-400 mb-1">
                    {Math.round(metric.value)}
                  </div>
                  <div class="text-xs font-mono text-ink-400">{metric.label}</div>
                </div>
              {/each}
            </div>
            <p class="text-ink-300 text-sm leading-relaxed mb-4">{repo.analysis.reasoning}</p>
            <div class="flex flex-wrap gap-2">
              {#each repo.analysis.tags as tag}
                <span class="badge-accent">{tag}</span>
              {/each}
            </div>
          </div>
        {/if}

        <!-- README -->
        {#if repo.readme}
          <div class="card p-6">
            <p class="section-label mb-4">README</p>
            <pre class="font-mono text-xs text-ink-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">{repo.readme.slice(0, 5000)}</pre>
          </div>
        {/if}
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Stats -->
        <div class="card p-5">
          <p class="section-label mb-4">Stats</p>
          <div class="space-y-3">
            {#each [
              { label: '★ Stars', value: repo.stars },
              { label: '⑃ Forks', value: repo.forks },
              { label: '◎ Open Issues', value: repo.openIssues },
              { label: '⊙ Commits', value: repo.commitCount },
            ] as stat}
              <div class="flex justify-between items-center">
                <span class="font-mono text-xs text-ink-400">{stat.label}</span>
                <span class="font-mono text-sm text-ink-200">{stat.value.toLocaleString()}</span>
              </div>
            {/each}
          </div>
        </div>

        <!-- Languages -->
        {#if topLanguages.length > 0}
          <div class="card p-5">
            <p class="section-label mb-4">Languages</p>
            {#each topLanguages as [lang, bytes]}
              <div class="mb-2">
                <div class="flex justify-between mb-1">
                  <span class="font-mono text-xs text-ink-300">{lang}</span>
                  <span class="font-mono text-xs text-ink-500">
                    {Math.round(bytes / 1024)}KB
                  </span>
                </div>
              </div>
            {/each}
          </div>
        {/if}

        <!-- Topics -->
        {#if repo.topics.length > 0}
          <div class="card p-5">
            <p class="section-label mb-4">Topics</p>
            <div class="flex flex-wrap gap-2">
              {#each repo.topics as topic}
                <span class="badge">{topic}</span>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
