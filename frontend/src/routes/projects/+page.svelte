<script lang="ts">
  import { onMount } from 'svelte';
  import { getAllRepositories } from '$api';
  import type { Repository } from '$api';
  import RepoCard from '$components/RepoCard.svelte';

  let repos: Repository[] = [];
  let total = 0;
  let page = 1;
  let loading = false;
  let filter = 'all';
  let search = '';

  $: languages = [...new Set(repos.map(r => r.language).filter(Boolean))] as string[];

  $: filtered = repos.filter(r => {
    const matchesLang = filter === 'all' || r.language === filter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      (r.description?.toLowerCase().includes(q) ?? false) ||
      r.topics.some(t => t.toLowerCase().includes(q));
    return matchesLang && matchesSearch;
  });

  async function load() {
    loading = true;
    const result = await getAllRepositories(page);
    repos = result.repos;
    total = result.total;
    loading = false;
  }

  onMount(load);
</script>

<svelte:head>
  <title>Projects — Portfolio</title>
  <meta name="description" content="All public GitHub repositories, curated and analyzed by AI." />
</svelte:head>

<section class="container pt-32 pb-24">
  <p class="section-label mb-4">Work</p>
  <h1 class="font-display text-5xl md:text-6xl mb-4">Projects</h1>
  <p class="text-ink-400 text-lg mb-12 max-w-lg">
    {total} public repositories, analyzed and ranked by AI. Only the best are featured.
  </p>

  <!-- Filters -->
  <div class="flex flex-wrap gap-3 mb-10">
    <input
      type="text"
      placeholder="Search repositories..."
      bind:value={search}
      class="flex-1 min-w-48 bg-surface-raised border border-surface-border rounded-lg px-4 py-2
             font-mono text-sm text-ink-200 placeholder-ink-500 focus:outline-none focus:border-accent-500
             transition-colors"
    />
    <div class="flex flex-wrap gap-2">
      <button
        class="badge cursor-pointer transition-colors {filter === 'all' ? 'badge-accent' : ''}"
        on:click={() => (filter = 'all')}
      >All</button>
      {#each languages as lang}
        <button
          class="badge cursor-pointer transition-colors {filter === lang ? 'badge-accent' : ''}"
          on:click={() => (filter = lang)}
        >{lang}</button>
      {/each}
    </div>
  </div>

  <!-- Grid -->
  {#if loading}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each Array(6) as _}
        <div class="card h-64 animate-pulse" />
      {/each}
    </div>
  {:else if filtered.length === 0}
    <p class="text-ink-400 text-center py-20">No repositories match your search.</p>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each filtered as repo, i}
        <RepoCard {repo} cls="animate-fade-up opacity-0 stagger-{Math.min(i + 1, 5)}" />
      {/each}
    </div>
  {/if}
</section>
