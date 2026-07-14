<script lang="ts">
  import type { Repository, FeaturedProject } from '$api';

  export let repo: Repository | undefined | null = null;
  export let featured: FeaturedProject | null = null;
  export let cls: string = '';
  export let style: string = '';

  $: title = featured?.displayTitle ?? repo?.name ?? '';
  $: description = featured?.displayDescription ?? repo?.description ?? '';
  $: href = repo ? `/projects/${repo.fullName}` : '#';
  $: score = repo?.analysis?.aiScore;
  $: recommendation = repo?.analysis?.recommendation;
</script>

<a
  {href}
  class="card-hover flex flex-col p-6 group {cls}"
  {style}
>
  <!-- Header row -->
  <div class="flex items-start justify-between mb-3">
    <div class="flex-1 min-w-0">
      <span class="font-mono text-xs text-ink-400 mb-1 block">
        {repo?.language ?? ''}
      </span>
      <h3 class="font-display text-xl text-ink-100 group-hover:text-accent-400 transition-colors truncate">
        {title}
      </h3>
    </div>

    {#if score != null}
      <div class="ml-4 flex flex-col items-center shrink-0">
        <span class="font-display text-2xl text-accent-400 leading-none">{Math.round(score)}</span>
        <span class="font-mono text-xs text-ink-500">score</span>
      </div>
    {/if}
  </div>

  <!-- Description -->
  {#if description}
    <p class="text-ink-300 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
      {description}
    </p>
  {:else}
    <div class="flex-1" />
  {/if}

  <!-- Topics -->
  {#if repo?.topics?.length}
    <div class="flex flex-wrap gap-1.5 mb-4">
      {#each repo.topics.slice(0, 3) as topic}
        <span class="badge text-xs">{topic}</span>
      {/each}
      {#if repo.topics.length > 3}
        <span class="badge text-xs text-ink-500">+{repo.topics.length - 3}</span>
      {/if}
    </div>
  {/if}

  <!-- Footer stats -->
  <div class="flex items-center gap-4 text-ink-500 font-mono text-xs border-t border-surface-border pt-4">
    <span>★ {repo?.stars ?? 0}</span>
    <span>⑃ {repo?.forks ?? 0}</span>
    {#if recommendation}
      <span
        class="ml-auto badge
               {recommendation === 'include' ? 'badge-accent' : ''}"
      >
        {recommendation}
      </span>
    {/if}
    {#if featured?.pinned}
      <span class="badge-accent">pinned</span>
    {/if}
  </div>
</a>
