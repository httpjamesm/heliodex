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
      secsElapsed = 0;
    }

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
    if (!$activeProjectId) {
      goto(Pages.Projects);
    }
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

{#if mounted && project}
  <div class="container">
    <div class="header">
      <h1>Track <span class="project-name">{project.name}</span></h1>
    </div>

    <div class="track-container">
      <button
        class="track-button"
        class:working={$isTracking}
        onclick={toggleWorking}
        disabled={!project}
      >
        <div class="button-content">
          <div class="button-content-inner">
            <span class="status-text">
              {#if !project}
                No project selected
              {:else if $isTracking}
                {workStatusTexts[
                  Math.floor(Math.random() * workStatusTexts.length)
                ]}
              {:else}
                Paused
              {/if}
            </span>
            {#if secsElapsed > 0}
              <span class="time-elapsed"> {formatSeconds(secsElapsed)} </span>
            {/if}
          </div>
        </div>
      </button>
    </div>

    {#if !$isTracking && logs.length > 0}
      <TimeLogs {logs} show={showLogs} />
    {/if}
    <div class="wave-container">
      <Wave
        speed={$isTracking ? 3 : 0}
        color={$isTracking ? "42, 157, 143" : "130, 130, 130"}
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
