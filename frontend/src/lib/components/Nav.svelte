<script lang="ts">
  import { page } from '$app/stores';

  const links = [
    { href: '/', label: 'Home' },
    { href: '/projects', label: 'Projects' },
    { href: '/analytics', label: 'Analytics' },
  ];

  let open = false;

  $: currentPath = $page.url.pathname;
</script>

<header
  class="fixed top-0 left-0 right-0 z-40 border-b border-surface-border/60
         bg-ink-900/80 backdrop-blur-md"
>
  <div class="container flex items-center justify-between h-16">
    <!-- Logo -->
    <a href="/" class="font-display text-xl text-ink-100 hover:text-accent-400 transition-colors">
      akshayka
    </a>

    <!-- Desktop nav -->
    <nav class="hidden md:flex items-center gap-1" aria-label="Main navigation">
      {#each links as link}
        <a
          href={link.href}
          class="btn-ghost text-sm py-1.5 px-3
                 {currentPath === link.href ? 'text-ink-100 bg-surface-raised' : 'text-ink-400'}"
        >
          {link.label}
        </a>
      {/each}
    </nav>

    <!-- Mobile hamburger -->
    <button
      class="md:hidden btn-ghost p-2"
      on:click={() => (open = !open)}
      aria-label="Toggle menu"
    >
      <span class="block w-5 h-px bg-ink-300 mb-1 transition-transform {open ? 'rotate-45 translate-y-1.5' : ''}" />
      <span class="block w-5 h-px bg-ink-300 mb-1 transition-opacity {open ? 'opacity-0' : ''}" />
      <span class="block w-5 h-px bg-ink-300 transition-transform {open ? '-rotate-45 -translate-y-1.5' : ''}" />
    </button>
  </div>

  <!-- Mobile menu -->
  {#if open}
    <div class="md:hidden border-t border-surface-border bg-[#111111] animate-fade-in">
      <nav class="container py-4 space-y-1" aria-label="Mobile navigation">
        {#each links as link}
          <a
            href={link.href}
            on:click={() => (open = false)}
            class="block btn-ghost text-sm
                   {currentPath === link.href ? 'text-ink-100 bg-surface-raised' : 'text-ink-400'}"
          >
            {link.label}
          </a>
        {/each}
      </nav>
    </div>
  {/if}
</header>
