<script lang="ts">
  import BottomBar from "$lib/components/BottomBar.svelte";
  import { initDatabase } from "$lib/db/migrations";
  import { onMount, type Snippet } from "svelte";
  import { IconLoader2 } from "@tabler/icons-svelte";

  let { children }: { children: Snippet } = $props();

  let databaseInitialized = $state(false);

  onMount(async () => {
    await initDatabase();
    databaseInitialized = true;
  });
</script>

<div class="layout">
  <div class="content">
    {#if databaseInitialized}
      {@render children?.()}
    {/if}
  </div>
  <BottomBar />
</div>

<style lang="scss">
  .layout {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;

    .content {
      position: relative;
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
      overflow-y: auto;
    }
  }
</style>
