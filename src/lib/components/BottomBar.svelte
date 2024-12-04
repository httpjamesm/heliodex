<script lang="ts">
  import { page } from "$app/stores";
  import {
    IconHome,
    IconStopwatch,
    IconBriefcase,
    IconSettings,
  } from "@tabler/icons-svelte";
  import { Pages } from "$lib/pages";
  import { selectionFeedback } from "@tauri-apps/plugin-haptics";

  const screens = [
    {
      label: "Home",
      href: Pages.Home,
      icon: IconHome,
    },
    {
      label: "Track",
      href: Pages.Track,
      icon: IconStopwatch,
    },
    {
      label: "Projects",
      href: Pages.Projects,
      icon: IconBriefcase,
    },
    {
      label: "Settings",
      href: Pages.Settings,
      icon: IconSettings,
    },
  ];
</script>

<div class="bottom-bar">
  <div class="container">
    {#each screens as screen}
      <a
        href={screen.href}
        class:active={$page.url.pathname === screen.href}
        onclick={async () => {
          try {
            await selectionFeedback();
          } catch {}
        }}
      >
        <screen.icon />
        {screen.label}
      </a>
    {/each}
  </div>
</div>

<style lang="scss">
  .bottom-bar {
    width: 100%;
    min-height: 5rem;
    background-color: var(--menu-color);
    border-top: 1px solid var(--surface-border-color);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
    view-transition-name: bottom-bar;

    .container {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      box-sizing: border-box;

      a {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 0.25rem;
        text-decoration: none;
        color: var(--text-color);
        opacity: 0.5;
        font-size: 0.75rem;

        &.active {
          opacity: 1;
        }
      }
    }
  }
</style>
