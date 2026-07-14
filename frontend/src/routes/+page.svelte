<script lang="ts">
  import { onMount } from 'svelte';
  import { getStats } from '$api';
  import type { PortfolioStats } from '$api';
  import StatBadge from '$components/StatBadge.svelte';

  let stats: PortfolioStats | null = null;
  let copied = false;
  const email = 'ka.akshay.kaa@gmail.com';

  onMount(async () => {
    stats = await getStats();
  });

  async function handleEmail() {
    // On desktop: copy to clipboard. On mobile: open mailto.
    if (window.matchMedia('(hover: hover)').matches) {
      await navigator.clipboard.writeText(email);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } else {
      window.location.href = `mailto:${email}`;
    }
  }
</script>

<svelte:head>
  <title>Akshay K A — Developer Portfolio</title>
  <meta name="description" content="I build systems that scale. Technology is how I build. Philosophy is how I think. Systems are where they meet." />
</svelte:head>

<!-- ─── Hero ─────────────────────────────────────────────────── -->
<section class="min-h-screen flex flex-col justify-center container pt-32 pb-24">
  <div class="max-w-3xl">
    <p class="section-label mb-6 animate-fade-in">Available for opportunities</p>
    <h1 class="font-display text-6xl md:text-7xl lg:text-8xl leading-[1.05] mb-8 animate-fade-up stagger-1">
      Engineering ideas<br />
      <span class="text-gradient">worth building.</span>
    </h1>

    <!-- Bio -->
    <div class="font-body text-ink-300 text-lg leading-relaxed max-w-2xl mb-10 animate-fade-up stagger-2 space-y-4">
      <p class="italic text-ink-400 border-l-2 border-accent-500 pl-4">
        Technology is how I build.<br />
        Philosophy is how I think.<br />
        Systems are where they meet.
      </p>
      <p>
        I'm interested in the principles behind software as much as the software itself.
        Whether designing backend architecture, building AI-powered tools, or contributing to open source,
        I try to reduce complexity into something people can understand and rely on.
      </p>
    </div>

    <!-- CTAs -->
    <div class="flex flex-wrap gap-4 animate-fade-up stagger-3">
      <a href="/projects" class="btn-primary">View Projects</a>
      <a
        href="https://github.com/akshay-k-a-dev"
        target="_blank"
        rel="noopener"
        class="btn-outline flex items-center gap-2"
      >
        <!-- GitHub icon -->
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        GitHub
      </a>
      <button
        on:click={handleEmail}
        class="btn-ghost flex items-center gap-2 font-mono text-sm"
        title={copied ? 'Copied!' : 'Click to copy email (desktop) or open mail (mobile)'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
        {#if copied}
          <span class="text-accent-400">Copied ✓</span>
        {:else}
          {email}
        {/if}
      </button>
    </div>
  </div>

  <!-- Stats row -->
  {#if stats}
    <div class="flex flex-wrap gap-8 mt-20 animate-fade-up stagger-4">
      <StatBadge label="Public Repos" value={stats.totalRepos} />
      <StatBadge label="GitHub Stars" value={stats.totalStars} />
      <StatBadge label="Languages" value={stats.totalLanguages} />
      <StatBadge label="Featured" value={stats.featuredCount} />
    </div>
  {/if}
</section>
