<script lang="ts">
  import "$lib/styles/main.scss";
  import type { Snippet } from "svelte";
  let { children }: { children: Snippet } = $props();
</script>

{@render children?.()}
