<script lang="ts">
  import Wave from "$lib/components/Wave.svelte";
  import TimeLogs from "$lib/components/TimeLogs.svelte";
  import {
    startTracking,
    stopTracking,
    getActiveLog,
    getProjectElapsedTime,
    getProjectLogs,
  } from "$lib/db/migrations";
  import { onMount, onDestroy } from "svelte";
  import {
    isTracking,
    activeLogId,
    activeProjectId,
  } from "$lib/stores/project";
  import type { Project } from "$lib/db/migrations";
  import { getProject } from "$lib/db/migrations";
  import { goto } from "$app/navigation";
  import { formatSeconds } from "$lib/utils/time";
  import { Pages } from "$lib/pages";
  import {
    selectionFeedback,
    impactFeedback,
  } from "@tauri-apps/plugin-haptics";
  import type { ImpactFeedbackStyle } from "@tauri-apps/plugin-haptics";

  let startTime: Date | null = $state(null);
  let secsElapsed = $state(0);
  let elapsedInterval: number | null = $state(null);
  let logs = $state([]);
  let showLogs = $state(false);
  let project = $state<Project | null>(null);
  let mounted = $state(false);
  let pulseInterval: number | null = $state(null);

  const loadActiveLog = async () => {
    if (!project) return;
    if (project.archived) {
      $isTracking = false;
      $activeLogId = null;
      secsElapsed = await getProjectElapsedTime(project.id);
      return;
    }
    const activeLog = await getActiveLog(project.id);
    if (activeLog) {
      $activeLogId = activeLog.id;
      $isTracking = true;
      startTime = new Date(activeLog.start_time);
      secsElapsed = Math.floor((Date.now() - activeLog.start_time) / 1000);
    } else {
      secsElapsed = await getProjectElapsedTime(project.id);
    }
  };

  const toggleWorking = async () => {
    try {
      await selectionFeedback();
    } catch {}
    if (!project) return;
    secsElapsed = 0;

    $isTracking = !$isTracking;
    if ($isTracking) {
      pulseInterval = setInterval(() => {
        try {
          impactFeedback(ImpactFeedbackStyle.Light);
        } catch {}
      }, 2000);
      startTime = new Date();
      $activeLogId = await startTracking(project.id);
      return;
    } else if ($activeLogId) {
      await stopTracking($activeLogId);
      $activeLogId = null;
    }

    // update logs
    loadLogs();
    // if not tracking, clear the pulse interval
    cleanup();
  };

  $effect(() => {
    if ($isTracking) {
      document.title = `Working - ${project?.name}`;
      if (!elapsedInterval) {
        elapsedInterval = setInterval(() => {
          if (!startTime) return;
          secsElapsed = Math.floor(
            (new Date().getTime() - startTime.getTime()) / 1000
          );
        }, 1000);
      }
    } else {
      document.title = "Paused - Track";
      if (elapsedInterval) {
        clearInterval(elapsedInterval);
        elapsedInterval = null;
      }
    }
  });

  onMount(() => {
    mounted = true;
  });

  const loadLogs = async () => {
    if (!project) return;
    logs = await getProjectLogs(project.id);
  };

  $effect(() => {
    if (!$isTracking && project) {
      loadLogs();
    }
  });

  $effect(() => {
    if ($activeProjectId) {
      const loadProject = async () => {
        project = await getProject($activeProjectId);
        if (!project) {
          activeProjectId.clear();
          goto(Pages.Projects);
        }
        await loadActiveLog();
        if (project.archived) {
          showLogs = true;
        }
      };
      loadProject();
    }
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

  const cleanup = () => {
    if (pulseInterval) {
      clearInterval(pulseInterval);
      pulseInterval = null;
    }
  };

  onDestroy(() => {
    cleanup();
  });
</script>

{#if mounted}
  <div class="container">
    <div class="header">
      <h1>
        Track {#if project}<span class="project-name">{project.name}</span>{/if}
      </h1>
    </div>

    <div class="track-container">
      {#if project}
        {#if project.archived}
          <div class="archived-notice">
            <span>Archived</span>
            <span class="time-elapsed">{formatSeconds(secsElapsed)}</span>
          </div>
        {:else}
          <button
            class="track-button"
            class:working={$isTracking}
            onclick={toggleWorking}
          >
            <div class="button-content">
              <div class="button-content-inner">
                <span class="status-text">
                  {#if $isTracking}
                    {workStatusTexts[
                      Math.floor(Math.random() * workStatusTexts.length)
                    ]}
                  {:else}
                    Paused
                  {/if}
                </span>
                {#if secsElapsed > 0}
                  <span class="time-elapsed">{formatSeconds(secsElapsed)}</span>
                {/if}
              </div>
            </div>
          </button>
        {/if}
      {:else}
        <button
          class="no-project"
          onclick={() => {
            try {
              selectionFeedback();
            } catch {}
            goto(Pages.Projects);
          }}
        >
          <span>Select project</span>
        </button>
      {/if}
    </div>

    {#if project && logs.length > 0}
      <TimeLogs
        {logs}
        show={showLogs}
        onUpdate={() => {
          if (!project?.archived) {
            loadLogs();
          }
        }}
        readonly={project.archived}
      />
    {/if}
    <div class="wave-container">
      <Wave
        speed={$isTracking ? 3 : 0}
        color={project
          ? $isTracking
            ? "42, 157, 143"
            : "130, 130, 130"
          : "130, 130, 130"}
      />
    </div>
  </div>
{/if}

<style lang="scss">
  .container {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    position: relative;
    height: 100%;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h1 {
      font-size: 2rem;
      font-weight: 500;
      margin: 0;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }

  .project-name {
    font-size: 1.5rem;
    font-weight: 500;
    color: #666;
  }

  .track-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .archived-notice {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background-color: var(--surface-color);
    border: 1px solid var(--surface-border-color);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: var(--text-secondary-color);
  }

  .track-button {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background-color: #e63946;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    color: white;

    &.working {
      background-color: #2a9d8f;
      animation: pulse 2s infinite;
    }

    &:hover {
      transform: scale(1.02);
    }

    &:active {
      transform: scale(0.98);
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

  .button-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    text-align: center;
  }

  .button-content-inner {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .status-text {
    font-size: 1.25rem;
    font-weight: 500;
  }

  .time-elapsed {
    font-size: 1rem;
    opacity: 0.8;
  }

  .no-project {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background-color: #666;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    color: white;
    font-size: 1.25rem;
    font-weight: 500;
    border: none;

    &:hover {
      transform: scale(1.02);
    }

    &:active {
      transform: scale(0.98);
    }
  }

  .wave-container {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 0;
    width: 100%;
  }
</style>
