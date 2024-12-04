<script lang="ts">
  import {
    getProjectElapsedTime,
    hasOpenTimeLog,
    archiveProject,
    unarchiveProject,
  } from "$lib/db/migrations";
  import { goto } from "$app/navigation";
  import ProjectDrawer from "./ProjectDrawer.svelte";
  import { deleteProject, renameProject } from "$lib/db/migrations";
  import { selectionFeedback } from "@tauri-apps/plugin-haptics";
  import { Pages } from "$lib/pages";
  import { IconArrowRight } from "@tabler/icons-svelte";

  let {
    name,
    id,
    archived = false,
    onclick,
    refreshProjects,
    disableDrawer = false,
  }: {
    name: string;
    id: number;
    archived: boolean;
    onclick: () => void;
    refreshProjects: () => void;
    disableDrawer?: boolean;
  } = $props();

  let hours = $state<number | undefined>(undefined);
  let isDrawerOpen = $state(false);
  let pressTimer: number | undefined = $state(undefined);
  let isPressing = $state(false);
  let isTracking = $state(false);

  const getColorFromName = (name: string) => {
    const hash = Array.from(name).reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 50%)`;
  };

  let color = $derived(getColorFromName(name));

  $effect(() => {
    const loadData = async () => {
      const time = await getProjectElapsedTime(id);
      hours = time / 3600;
      isTracking = await hasOpenTimeLog(id);
    };
    loadData();
  });

  const startTracking = () => {
    goto(Pages.Track);
  };

  const handlePointerDown = () => {
    isPressing = true;
    pressTimer = setTimeout(() => {
      if (!disableDrawer) {
        isDrawerOpen = true;
      }
      isPressing = false;
    }, 500) as unknown as number;
  };

  const handlePointerUp = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
    }
    if (isPressing) {
      onclick();
    }
    isPressing = false;
  };

  const handlePointerLeave = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
    }
    isPressing = false;
  };

  const handleRename = async (newName: string) => {
    await renameProject(id, newName);
    isDrawerOpen = false;
    refreshProjects();
  };

  const handleDelete = async () => {
    await deleteProject(id);
    isDrawerOpen = false;
    refreshProjects();
  };

  const handleArchive = async () => {
    await archiveProject(id);
    isDrawerOpen = false;
    refreshProjects();
  };

  const handleUnarchive = async () => {
    await unarchiveProject(id);
    isDrawerOpen = false;
    refreshProjects();
  };
</script>

<ProjectDrawer
  isOpen={isDrawerOpen}
  {name}
  {archived}
  onClose={() => (isDrawerOpen = false)}
  onRename={handleRename}
  onDelete={handleDelete}
  onArchive={handleArchive}
  onUnarchive={handleUnarchive}
/>

{#if hours !== undefined}
  <div
    class="project-card"
    class:active={isTracking}
    class:pressing={isPressing}
    class:archived
    onpointerdown={handlePointerDown}
    onpointerup={handlePointerUp}
    onpointerleave={handlePointerLeave}
  >
    <div class="left">
      <div class="color-bar" style:background-color={color}></div>
      <div class="content">
        <h2>{name}</h2>
        <p>{hours.toFixed(1)} hours</p>
      </div>
    </div>
    <div class="arrow">
      <IconArrowRight />
    </div>
  </div>
{/if}

<style lang="scss">
  .project-card {
    background-color: var(--surface-color);
    border: 1px solid var(--surface-border-color);
    border-radius: 0.5rem;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin: 0.5rem 0;
    touch-action: none;
    min-width: 0;
    opacity: 0;
    animation: fadeIn 0.2s ease forwards;

    &.active {
      border-color: #2a9d8f;
      box-shadow: 0 0 0 1px #2a9d8f;
    }

    &.pressing {
      transform: scale(0.98);
    }

    &.archived {
      opacity: 0.6 !important;
    }
  }

  .left {
    display: flex;
    gap: 1rem;
    flex: 1;
    min-width: 0;
  }

  .color-bar {
    width: 4px;
    border-radius: 2px;
    min-height: 100%;
  }

  .content {
    flex: 1;
    width: 100%;
    min-width: 0;

    h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 500;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      width: 100%;
    }

    p {
      margin: 0.5rem 0 0;
      color: var(--text-secondary-color);
    }
  }

  .arrow {
    display: flex;
    align-items: center;
    opacity: 0.5;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
