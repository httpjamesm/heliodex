<script lang="ts">
  import { fade, slide } from "svelte/transition";
  import { IconX } from "@tabler/icons-svelte";
  import type { Snippet } from "svelte";
  import { selectionFeedback } from "@tauri-apps/plugin-haptics";

  const {
    isOpen = false,
    close,
    children,
  }: { isOpen: boolean; close: () => void; children: Snippet } = $props();

  $effect(() => {
    if (isOpen) {
      try {
        await selectionFeedback();
      } catch {}
    }
  });
</script>

{#if isOpen}
  <div class="drawer-container" class:open={isOpen}>
    <div
      class="backdrop"
      on:click={close}
      transition:fade={{ duration: 200 }}
    ></div>
    <div class="drawer" transition:slide={{ axis: "y" }}>
      <div class="drawer-content">
        {@render children?.()}
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .drawer-container {
    position: fixed;
    inset: 0;
    z-index: 1000;
    pointer-events: none;

    &.open {
      pointer-events: auto;

      .drawer {
        transform: translateY(0);
      }
    }
  }

  .backdrop {
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.4);
  }

  .drawer {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--surface-color);
    transform: translateY(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    border-radius: 1rem 1rem 0 0;
    padding-bottom: 2rem;
  }

  .close-button {
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    color: var(--text-secondary-color);
    border-radius: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--surface-hover-color);
    }
  }

  .drawer-content {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
  }
</style>
