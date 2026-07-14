<script lang="ts">
  import { onMount } from 'svelte';
  import {
    getAdminStats,
    getPendingAnalyses,
    getAllRepositories,
    approveAnalysis,
    rejectAnalysis,
    overrideAnalysis,
    triggerSync,
    triggerAnalysis,
    triggerFullPipeline,
    deleteRepository,
    addExternalProject,
  } from '$api';
  import type { RepositoryAnalysis, AdminStats, Repository } from '$api';

  // ── Auth ────────────────────────────────────────────────────────
  let authed = false;
  let secret = '';

  function login() {
    localStorage.setItem('adminSecret', secret);
    authed = true;
    loadData();
  }

  // ── State ────────────────────────────────────────────────────────
  let stats: AdminStats | null = null;
  let pending: RepositoryAnalysis[] = [];
  let allRepos: Repository[] = [];
  let pipelineStatus = '';
  let loading = false;
  let activeTab: 'pending' | 'repos' | 'add' = 'pending';

  // Add external project form
  let externalUrl = '';
  let addStatus = '';
  let addLoading = false;

  // Override modal
  let overrideModal: { analysis: RepositoryAnalysis; decision: 'include' | 'exclude' | 'maybe' } | null = null;
  let overrideNote = '';

  async function loadData() {
    loading = true;
    try {
      const [s, p, r] = await Promise.all([
        getAdminStats(),
        getPendingAnalyses(),
        getAllRepositories(1, 100),
      ]);
      stats = s;
      pending = p;
      allRepos = r.repos;
    } finally {
      loading = false;
    }
  }

  // ── Pipeline ─────────────────────────────────────────────────────
  async function runPipeline(action: 'sync' | 'analyze' | 'full') {
    pipelineStatus = 'Running…';
    try {
      if (action === 'sync') await triggerSync();
      else if (action === 'analyze') await triggerAnalysis();
      else await triggerFullPipeline();
      pipelineStatus = 'Done ✓';
      await loadData();
    } catch (e) {
      pipelineStatus = `Error: ${(e as Error).message}`;
    }
  }

  // ── Review actions ───────────────────────────────────────────────
  async function approve(id: string) {
    await approveAnalysis(id);
    await loadData();
  }

  async function reject(id: string) {
    await rejectAnalysis(id);
    await loadData();
  }

  async function doOverride() {
    if (!overrideModal || !overrideNote.trim()) return;
    await overrideAnalysis(overrideModal.analysis.repositoryId, overrideModal.decision, overrideNote);
    overrideModal = null;
    overrideNote = '';
    await loadData();
  }

  function setOverrideDecision(d: string) {
    if (!overrideModal) return;
    overrideModal = { ...overrideModal, decision: d as 'include' | 'exclude' | 'maybe' };
  }

  // ── Delete repo ──────────────────────────────────────────────────
  async function handleDelete(repo: Repository) {
    if (!confirm(`Delete "${repo.fullName}" and all its analysis data? This cannot be undone.`)) return;
    try {
      await deleteRepository(repo.id);
      await loadData();
    } catch (e) {
      alert(`Error: ${(e as Error).message}`);
    }
  }

  // ── Add external project ─────────────────────────────────────────
  async function handleAddExternal() {
    if (!externalUrl.trim()) return;
    addLoading = true;
    addStatus = 'Fetching…';
    try {
      await addExternalProject(externalUrl.trim());
      addStatus = 'Added ✓ — run AI Analysis to score it.';
      externalUrl = '';
      await loadData();
    } catch (e) {
      addStatus = `Error: ${(e as Error).message}`;
    } finally {
      addLoading = false;
    }
  }

  onMount(() => {
    const stored = localStorage.getItem('adminSecret');
    if (stored) {
      secret = stored;
      authed = true;
      loadData();
    }
  });

  const statusColor: Record<string, string> = {
    PENDING: 'text-yellow-400',
    APPROVED: 'text-green-400',
    REJECTED: 'text-red-400',
    OVERRIDDEN: 'text-accent-400',
  };
</script>

<svelte:head>
  <title>Admin — Portfolio</title>
</svelte:head>

<!-- ── Login gate ─────────────────────────────────────────────── -->
{#if !authed}
  <div class="min-h-screen flex items-center justify-center container">
    <div class="card p-8 max-w-sm w-full">
      <h1 class="font-display text-3xl mb-6">Admin Access</h1>
      <input
        type="password"
        placeholder="Admin secret"
        bind:value={secret}
        on:keydown={(e) => e.key === 'Enter' && login()}
        class="w-full bg-surface-overlay border border-surface-border rounded-lg px-4 py-3
               font-mono text-sm text-ink-200 placeholder-ink-500 focus:outline-none
               focus:border-accent-500 transition-colors mb-4"
      />
      <button class="btn-primary w-full justify-center" on:click={login}>Enter</button>
    </div>
  </div>

{:else}
  <div class="container pt-28 pb-24">

    <!-- Header -->
    <div class="flex items-center justify-between mb-10">
      <div>
        <p class="section-label mb-2">Admin</p>
        <h1 class="font-display text-4xl">Dashboard</h1>
      </div>
      <button class="btn-ghost" on:click={() => { localStorage.removeItem('adminSecret'); authed = false; }}>
        Sign out
      </button>
    </div>

    <!-- Stats -->
    {#if stats}
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {#each [
          { label: 'Total Repos', value: stats.total, color: 'text-ink-200' },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-400' },
          { label: 'Approved', value: stats.approved, color: 'text-green-400' },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-400' },
          { label: 'Overridden', value: stats.overridden, color: 'text-accent-400' },
        ] as s}
          <div class="card p-5 text-center">
            <div class="font-display text-4xl {s.color} mb-1">{s.value}</div>
            <div class="font-mono text-xs text-ink-400">{s.label}</div>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Pipeline controls -->
    <div class="card p-6 mb-10">
      <p class="section-label mb-4">Pipeline</p>
      <div class="flex flex-wrap gap-3 items-center">
        <button class="btn-outline" on:click={() => runPipeline('sync')}>Sync GitHub</button>
        <button class="btn-outline" on:click={() => runPipeline('analyze')}>Run AI Analysis</button>
        <button class="btn-primary" on:click={() => runPipeline('full')}>Full Pipeline</button>
        {#if pipelineStatus}
          <span class="font-mono text-sm {pipelineStatus.startsWith('Error') ? 'text-red-400' : 'text-ink-400'}">
            {pipelineStatus}
          </span>
        {/if}
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-8 border-b border-surface-border">
      {#each [
        { id: 'pending', label: `Pending Review (${pending.length})` },
        { id: 'repos',   label: `All Repos (${allRepos.length})` },
        { id: 'add',     label: 'Add External' },
      ] as tab}
        <button
          class="font-mono text-sm px-4 py-2 border-b-2 transition-colors
                 {activeTab === tab.id
                   ? 'border-accent-500 text-ink-100'
                   : 'border-transparent text-ink-500 hover:text-ink-300'}"
          on:click={() => (activeTab = tab.id)}
        >
          {tab.label}
        </button>
      {/each}
    </div>

    <!-- ── Tab: Pending Review ──────────────────────────────────── -->
    {#if activeTab === 'pending'}
      {#if loading}
        <div class="space-y-4">
          {#each Array(3) as _}
            <div class="card h-36 animate-pulse" />
          {/each}
        </div>
      {:else if pending.length === 0}
        <p class="text-ink-400 text-center py-16">All caught up — no analyses pending review.</p>
      {:else}
        <div class="space-y-4">
          {#each pending as analysis}
            <div class="card p-6">
              <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h3 class="font-mono text-ink-200 mb-1">
                    {analysis.repository?.fullName ?? analysis.repositoryId}
                  </h3>
                  <p class="text-ink-400 text-sm">{analysis.repository?.description ?? ''}</p>
                </div>
                <div class="flex items-center gap-3">
                  <span class="font-display text-3xl text-accent-400">{Math.round(analysis.aiScore)}</span>
                  <span class="badge {analysis.recommendation === 'include' ? 'badge-accent' : ''}">
                    {analysis.recommendation}
                  </span>
                </div>
              </div>

              <p class="text-ink-300 text-sm mb-4">{analysis.reasoning}</p>

              <div class="flex flex-wrap gap-2 mb-4">
                {#each analysis.highlights as h}
                  <span class="badge-accent text-xs">{h}</span>
                {/each}
              </div>

              <div class="flex flex-wrap gap-2">
                <button class="btn-primary text-xs py-1.5 px-3" on:click={() => approve(analysis.repositoryId)}>
                  ✓ Approve
                </button>
                <button class="btn-ghost text-xs py-1.5 px-3" on:click={() => reject(analysis.repositoryId)}>
                  ✗ Reject
                </button>
                <button
                  class="btn-outline text-xs py-1.5 px-3"
                  on:click={() => { overrideModal = { analysis, decision: 'include' }; }}
                >
                  Override
                </button>
                <a
                  href={analysis.repository?.url}
                  target="_blank"
                  rel="noopener"
                  class="btn-ghost text-xs py-1.5 px-3"
                >
                  GitHub ↗
                </a>
                <button
                  class="btn-ghost text-xs py-1.5 px-3 text-red-400 hover:text-red-300"
                  on:click={() => analysis.repository && handleDelete(analysis.repository)}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}

    <!-- ── Tab: All Repos ──────────────────────────────────────── -->
    {:else if activeTab === 'repos'}
      {#if loading}
        <div class="space-y-2">
          {#each Array(6) as _}
            <div class="card h-14 animate-pulse" />
          {/each}
        </div>
      {:else if allRepos.length === 0}
        <p class="text-ink-400 text-center py-16">No repositories synced yet. Run Sync GitHub first.</p>
      {:else}
        <div class="space-y-2">
          {#each allRepos as repo}
            <div class="card p-4 flex items-center justify-between gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3 flex-wrap">
                  <span class="font-mono text-sm text-ink-200 truncate">{repo.fullName}</span>
                  {#if repo.language}
                    <span class="font-mono text-xs text-ink-500">{repo.language}</span>
                  {/if}
                  {#if repo.analysis}
                    <span class="font-mono text-xs {statusColor[repo.analysis.status]}">
                      {repo.analysis.status} · {Math.round(repo.analysis.aiScore)}
                    </span>
                  {:else}
                    <span class="font-mono text-xs text-ink-600">not analysed</span>
                  {/if}
                </div>
                {#if repo.description}
                  <p class="text-ink-500 text-xs mt-0.5 truncate">{repo.description}</p>
                {/if}
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <a href={repo.url} target="_blank" rel="noopener" class="btn-ghost text-xs py-1 px-2">↗</a>
                <button
                  class="btn-ghost text-xs py-1 px-2 text-red-400 hover:text-red-300"
                  on:click={() => handleDelete(repo)}
                >
                  🗑
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}

    <!-- ── Tab: Add External ───────────────────────────────────── -->
    {:else if activeTab === 'add'}
      <div class="max-w-xl">
        <p class="text-ink-400 text-sm mb-6">
          Add a GitHub repository that isn't in your account — a contribution, a fork you're proud of,
          or any public repo. It will be fetched and queued for AI analysis.
        </p>
        <div class="card p-6">
          <label class="block font-mono text-xs text-ink-400 mb-2" for="ext-url">GitHub URL</label>
          <input
            id="ext-url"
            type="url"
            placeholder="https://github.com/owner/repo"
            bind:value={externalUrl}
            on:keydown={(e) => e.key === 'Enter' && handleAddExternal()}
            class="w-full bg-surface-overlay border border-surface-border rounded-lg px-4 py-3
                   font-mono text-sm text-ink-200 placeholder-ink-500 focus:outline-none
                   focus:border-accent-500 transition-colors mb-4"
          />
          <div class="flex items-center gap-4">
            <button class="btn-primary" disabled={addLoading} on:click={handleAddExternal}>
              {addLoading ? 'Fetching…' : 'Add Project'}
            </button>
            {#if addStatus}
              <span class="font-mono text-sm {addStatus.startsWith('Error') ? 'text-red-400' : 'text-green-400'}">
                {addStatus}
              </span>
            {/if}
          </div>
        </div>
      </div>
    {/if}

  </div>

  <!-- ── Override modal ─────────────────────────────────────────── -->
  {#if overrideModal}
    <div
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div class="card p-6 max-w-md w-full">
        <h2 class="font-display text-2xl mb-4">Override Decision</h2>
        <div class="flex gap-2 mb-4">
          {#each ['include', 'exclude', 'maybe'] as d}
            <button
              class="badge cursor-pointer flex-1 justify-center {overrideModal.decision === d ? 'badge-accent' : ''}"
              on:click={() => setOverrideDecision(d)}
            >{d}</button>
          {/each}
        </div>
        <textarea
          placeholder="Reason for override (required)"
          bind:value={overrideNote}
          rows={3}
          class="w-full bg-surface-overlay border border-surface-border rounded-lg px-4 py-3
                 font-body text-sm text-ink-200 placeholder-ink-500 focus:outline-none
                 focus:border-accent-500 transition-colors mb-4 resize-none"
        />
        <div class="flex gap-3">
          <button class="btn-primary flex-1 justify-center" on:click={doOverride}>Save Override</button>
          <button class="btn-ghost" on:click={() => { overrideModal = null; overrideNote = ''; }}>Cancel</button>
        </div>
      </div>
    </div>
  {/if}
{/if}
