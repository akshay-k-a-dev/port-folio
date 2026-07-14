<script lang="ts">
  import { onMount } from 'svelte';
  import { getLatestSnapshot, getSnapshots } from '$api';
  import type { AnalyticsSnapshot } from '$api';

  let snapshot: AnalyticsSnapshot | null = null;
  let snapshots: AnalyticsSnapshot[] = [];

  onMount(async () => {
    [snapshot, snapshots] = await Promise.all([getLatestSnapshot(), getSnapshots()]);
  });

  $: topLangs = snapshot
    ? Object.entries(snapshot.languages as Record<string, number>)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
    : [];

  $: maxLangCount = topLangs[0]?.[1] ?? 1;

  $: topTopics = snapshot
    ? Object.entries(snapshot.topTopics as Record<string, number>)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
    : [];
</script>

<svelte:head>
  <title>Analytics — Portfolio</title>
  <meta name="description" content="Portfolio analytics — star trends, language breakdown, and repository growth." />
</svelte:head>

<section class="container pt-32 pb-24">
  <p class="section-label mb-4">Data</p>
  <h1 class="font-display text-5xl md:text-6xl mb-12">Analytics</h1>

  {#if !snapshot}
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      {#each Array(4) as _}
        <div class="card h-28 animate-pulse" />
      {/each}
    </div>
  {:else}
    <!-- Key metrics -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      {#each [
        { label: 'Repositories', value: snapshot.totalRepos },
        { label: 'Total Stars', value: snapshot.totalStars },
        { label: 'Total Forks', value: snapshot.totalForks },
        { label: 'Featured', value: snapshot.featuredCount },
      ] as m}
        <div class="card p-6">
          <div class="font-display text-4xl text-accent-400 mb-1">
            {m.value.toLocaleString()}
          </div>
          <div class="font-mono text-xs text-ink-400">{m.label}</div>
        </div>
      {/each}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Language breakdown -->
      <div class="card p-6">
        <p class="section-label mb-6">Languages</p>
        <div class="space-y-3">
          {#each topLangs as [lang, count]}
            <div>
              <div class="flex justify-between mb-1">
                <span class="font-mono text-sm text-ink-200">{lang}</span>
                <span class="font-mono text-xs text-ink-400">{count} repos</span>
              </div>
              <div class="h-1.5 bg-surface-overlay rounded-full overflow-hidden">
                <div
                  class="h-full bg-accent-500 rounded-full transition-all duration-700"
                  style="width: {(count / maxLangCount) * 100}%"
                />
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Top topics -->
      <div class="card p-6">
        <p class="section-label mb-6">Top Topics</p>
        <div class="flex flex-wrap gap-2">
          {#each topTopics as [topic, count]}
            <span class="badge-accent text-xs py-1 px-3">
              {topic} <span class="opacity-60 ml-1">×{count}</span>
            </span>
          {/each}
        </div>
      </div>
    </div>

    <!-- Snapshot history table -->
    {#if snapshots.length > 1}
      <div class="card p-6 mt-8">
        <p class="section-label mb-6">History</p>
        <div class="overflow-x-auto">
          <table class="w-full font-mono text-sm">
            <thead>
              <tr class="text-left text-ink-400 border-b border-surface-border">
                <th class="pb-3 font-normal">Date</th>
                <th class="pb-3 font-normal">Repos</th>
                <th class="pb-3 font-normal">Stars</th>
                <th class="pb-3 font-normal">Forks</th>
                <th class="pb-3 font-normal">Featured</th>
              </tr>
            </thead>
            <tbody>
              {#each snapshots.slice(-10).reverse() as s}
                <tr class="border-b border-surface-border/50 hover:bg-surface-raised transition-colors">
                  <td class="py-3 text-ink-400">{new Date(s.snapshotAt).toLocaleDateString()}</td>
                  <td class="py-3 text-ink-200">{s.totalRepos}</td>
                  <td class="py-3 text-ink-200">{s.totalStars.toLocaleString()}</td>
                  <td class="py-3 text-ink-200">{s.totalForks.toLocaleString()}</td>
                  <td class="py-3 text-ink-200">{s.featuredCount}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  {/if}
</section>
