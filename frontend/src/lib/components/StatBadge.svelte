<script lang="ts">
  export let label: string;
  export let value: number;
</script>

<div class="flex flex-col gap-1">
  <span class="font-display text-3xl md:text-4xl text-ink-100">
    {value.toLocaleString()}
  </span>
  <span class="font-mono text-xs text-ink-400 tracking-widest uppercase">{label}</span>
</div>
