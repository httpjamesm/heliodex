<script lang="ts">
  import BottomBar from "$lib/components/BottomBar.svelte";
  import "$lib/styles/main.scss";
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<div class="layout">
  <div class="content">
    {@render children?.()}
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
    }
  }
</style>
