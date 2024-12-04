<script lang="ts">
  import type { ComponentType } from "svelte";
  import { selectionFeedback } from "@tauri-apps/plugin-haptics";

  let { icon, onclick }: { icon: ComponentType; onclick: () => void } =
    $props();
</script>

<button
  class="fab"
  onclick={async () => {
    try {
      await selectionFeedback();
    } catch {}
    onclick();
  }}
>
  <svelte:component this={icon} size={24} />
</button>

<style lang="scss">
  .fab {
    position: fixed;
    bottom: 6.5rem;
    right: 2rem;
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 50%;
    background-color: #2a9d8f;
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    &:active {
      transform: translateY(0);
    }
  }
</style>
