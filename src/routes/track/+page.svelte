<script lang="ts">
  import Wave from "$lib/components/Wave.svelte";
  import {
    getProjects,
    type Project,
    startTracking,
    stopTracking,
    getActiveLog,
  } from "$lib/db/migrations";
  import { onMount } from "svelte";
  import { page } from "$app/stores";

  let isWorking = $state(false);
  let startTime: Date | null = $state(null);
  let secsElapsed = $state(0);
  let elapsedInterval: number | null = $state(null);
  let project = $state<Project | null>(null);
  let activeLogId = $state<number | null>(null);

  const loadProject = async () => {
    const projectId = Number($page.url.searchParams.get("project_id"));
    if (!projectId) return;

    const projects = await getProjects();
    project = projects.find((p) => p.id === projectId) ?? null;

    const activeLog = await getActiveLog(projectId);
    if (activeLog) {
      activeLogId = activeLog.id;
      isWorking = true;
    }
  };

  const toggleWorking = async () => {
    if (!project) return;

    isWorking = !isWorking;
    if (isWorking) {
      activeLogId = await startTracking(project.id);
    } else if (activeLogId) {
      await stopTracking(activeLogId);
      activeLogId = null;
    }
  };

  $effect(() => {
    if (isWorking) {
      startTime = new Date();
      elapsedInterval = setInterval(() => {
        secsElapsed = Math.floor(
          (new Date().getTime() - startTime?.getTime()!) / 1000
        );
      }, 1000);
    } else {
      if (elapsedInterval) {
        clearInterval(elapsedInterval);
        elapsedInterval = null;
      }
    }
  });

  onMount(() => {
    loadProject();
  });

  const workStatusTexts = [
    "Stay focused!",
    "Keep pushing!",
    "Almost there!",
    "You got this!",
    "Finish strong!",
    "Stay productive!",
    "Keep it up!",
    "You're doing it!",
    "Onward!",
    "Finish it!",
  ];
</script>

<div class="container">
  <button
    class="track-button"
    class:working={isWorking}
    onclick={toggleWorking}
    disabled={!project}
  >
    <div class="button-content">
      <div class="button-content-inner">
        <span class="status-text">
          {#if !project}
            No project selected
          {:else if isWorking}
            {workStatusTexts[
              Math.floor(Math.random() * workStatusTexts.length)
            ]}
          {:else}
            Paused
          {/if}
        </span>
        {#if secsElapsed > 0 && isWorking}
          <span class="time-elapsed"> {secsElapsed}s </span>
        {/if}
      </div>
    </div>
  </button>
</div>

<div class="wave-container">
  <Wave
    speed={isWorking ? 3 : 0}
    color={isWorking ? "42, 157, 143" : "130, 130, 130"}
  />
</div>

<style lang="scss">
  .container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .track-button {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    background-color: #e63946;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    padding: 3rem;
    box-sizing: border-box;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
  }

  .track-button.working {
    background-color: #2a9d8f;
    animation: pulse 2s infinite;
  }

  .button-content {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: white;
    font-size: 1.5rem;
    font-weight: 600;

    .button-content-inner {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .time-elapsed {
        font-size: 1rem;
        font-weight: 400;
      }
    }
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(42, 157, 143, 0.4);
    }
    70% {
      transform: scale(1.05);
      box-shadow: 0 0 0 15px rgba(42, 157, 143, 0);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(42, 157, 143, 0);
    }
  }

  .track-button:not(:disabled):hover {
    transform: scale(1.02);
  }

  .track-button:not(:disabled):active {
    transform: scale(0.98);
  }

  .wave-container {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 0;
    width: 100%;
  }
</style>
