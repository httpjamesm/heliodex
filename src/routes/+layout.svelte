<script lang="ts">
  import "$lib/styles/main.scss";
  import { onMount, type Snippet } from "svelte";
  import { onNavigate } from "$app/navigation";
  import { page } from "$app/stores";
  import { setTheme } from "$lib/utils/theme";

  let { children }: { children: Snippet } = $props();

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;
    if ($page.url.pathname.startsWith("/app")) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });

  onMount(() => {
    const theme = window.localStorage.getItem("theme") || "System";
    setTheme(theme as Theme);
  });
</script>

{@render children?.()}

<style>
  @keyframes fade-in {
    from {
      opacity: 0;
    }
  }

  @keyframes fade-out {
    to {
      opacity: 0;
    }
  }

  @keyframes slide-from-right {
    from {
      transform: translateX(100%);
    }
  }

  @keyframes slide-to-left {
    to {
      transform: translateX(-100%);
    }
  }

  :root::view-transition-old(root) {
    animation:
      90ms cubic-bezier(0.4, 0, 1, 1) both fade-out,
      300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-left;
  }

  :root::view-transition-new(root) {
    animation:
      210ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in,
      300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-right;
  }

  @media (prefers-reduced-motion) {
    ::view-transition-group(*),
    ::view-transition-old(*),
    ::view-transition-new(*) {
      animation: none !important;
    }
  }
</style>
