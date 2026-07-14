<script lang="ts">
  import '../app.css';
  import Nav from '$components/Nav.svelte';
  import Footer from '$components/Footer.svelte';
</script>

<Nav />
<main>
  <slot />
</main>
<Footer />
