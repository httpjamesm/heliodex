<script lang="ts">
  import { getProjectElapsedTime } from "$lib/db/migrations";
  import { activeProjectId } from "$lib/stores/project";
  import { IconArrowRight } from "@tabler/icons-svelte";
  import { goto } from "$app/navigation";
  import ProjectDrawer from "./ProjectDrawer.svelte";
  import { deleteProject, renameProject } from "$lib/db/migrations";

  let {
    name,
    id,
    onclick,
    refreshProjects,
  }: {
    name: string;
    id: number;
    onclick: () => void;
    refreshProjects: () => void;
  } = $props();

  let hours = $state(0);
  let isDrawerOpen = $state(false);
  let pressTimer: number | undefined = $state(undefined);
  let isPressing = $state(false);

  const getColorFromName = (name: string) => {
    const hash = Array.from(name).reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 50%)`;
  };

  let color = $derived(getColorFromName(name));
  let isActive = $derived($activeProjectId === id);

  $effect(() => {
    const loadTime = async () => {
      const time = await getProjectElapsedTime(id);
      hours = time / 3600;
    };
    loadTime();
  });

  const startTracking = () => {
    activeProjectId.set(id);
    goto("/track");
  };

  const handlePointerDown = () => {
    isPressing = true;
    pressTimer = setTimeout(() => {
      isDrawerOpen = true;
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
</script>

<ProjectDrawer
  isOpen={isDrawerOpen}
  {name}
  onClose={() => (isDrawerOpen = false)}
  onRename={handleRename}
  onDelete={handleDelete}
/>

<div
  class="project-card"
  class:active={isActive}
  class:pressing={isPressing}
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

    &.active {
      border-color: #2a9d8f;
      box-shadow: 0 0 0 1px #2a9d8f;
    }

    &.pressing {
      transform: scale(0.98);
    }
  }

  .left {
    display: flex;
    gap: 1rem;
    flex: 1;
  }

  .color-bar {
    width: 4px;
    border-radius: 2px;
    min-height: 100%;
  }

  .content {
    flex: 1;

    h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 500;
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
</style>
