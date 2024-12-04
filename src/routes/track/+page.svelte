<script lang="ts">
  import Wave from "$lib/components/Wave.svelte";
  import TimeLogs from "$lib/components/TimeLogs.svelte";
  import {
    getProjects,
    startTracking,
    stopTracking,
    getActiveLog,
    getProjectElapsedTime,
    getProjectLogs,
  } from "$lib/db/migrations";
  import { onMount } from "svelte";
  import {
    selectedProject,
    isTracking,
    activeLogId,
  } from "$lib/stores/project";

  let startTime: Date | null = $state(null);
  let secsElapsed = $state(0);
  let elapsedInterval: number | null = $state(null);
  let logs = $state([]);
  let showLogs = $state(false);

  const loadActiveLog = async () => {
    if (!$selectedProject) return;
    const activeLog = await getActiveLog($selectedProject.id);
    if (activeLog) {
      $activeLogId = activeLog.id;
      $isTracking = true;
      startTime = new Date(activeLog.start_time);
      secsElapsed = Math.floor((Date.now() - activeLog.start_time) / 1000);
    } else {
      secsElapsed = await getProjectElapsedTime($selectedProject.id);
    }
  };

  const toggleWorking = async () => {
    if (!$selectedProject) return;

    $isTracking = !$isTracking;
    if ($isTracking) {
      startTime = new Date();
      $activeLogId = await startTracking($selectedProject.id);
    } else if ($activeLogId) {
      await stopTracking($activeLogId);
      $activeLogId = null;
      secsElapsed = 0;
    }
  };

  $effect(() => {
    if ($isTracking) {
      document.title = `Working - ${$selectedProject?.name}`;
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
    loadActiveLog();
  });

  const loadLogs = async () => {
    if (!$selectedProject) return;
    logs = await getProjectLogs($selectedProject.id);
  };

  $effect(() => {
    if (!$isTracking && $selectedProject) {
      loadLogs();
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
</script>

<div class="container">
  <div class="header">
    <h1>Track <span class="project-name">{$selectedProject?.name}</span></h1>
  </div>

  <div class="track-container">
    <button
      class="track-button"
      class:working={$isTracking}
      onclick={toggleWorking}
      disabled={!$selectedProject}
    >
      <div class="button-content">
        <div class="button-content-inner">
          <span class="status-text">
            {#if !$selectedProject}
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
            <span class="time-elapsed"> {secsElapsed}s </span>
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
