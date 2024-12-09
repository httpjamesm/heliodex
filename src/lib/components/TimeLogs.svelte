<script lang="ts">
  import type { TimeLog } from "$lib/db/migrations";
  import RelativeTime from "@yaireo/relative-time";
  import { fade, slide } from "svelte/transition";
  import TimeLogDrawer from "./TimeLogDrawer.svelte";
  import { deleteTimeLog } from "$lib/db/migrations";
  import { formatSeconds } from "$lib/utils/time";
  import { selectionFeedback } from "@tauri-apps/plugin-haptics";
  import ManualLogModal from "./ManualLogModal.svelte";

  let {
    logs,
    show,
    onUpdate,
    readonly = false,
    projectId,
  }: {
    logs: TimeLog[];
    show: boolean;
    onUpdate: () => void;
    readonly: boolean;
    projectId: number;
  } = $props();

  const relativeTime = new RelativeTime();

  let selectedLog = $state<TimeLog | null>(null);
  let isDrawerOpen = $state(false);
  let isManualLogModalOpen = $state(false);

  const handleLogPress = (log: TimeLog) => {
    if (readonly) return;
    selectedLog = log;
    isDrawerOpen = true;
  };

  const handleDelete = async () => {
    if (selectedLog) {
      await deleteTimeLog(selectedLog.id);
      onUpdate();
      isDrawerOpen = false;
    }
  };
</script>

<ManualLogModal
  {projectId}
  isOpen={isManualLogModalOpen}
  onClose={() => (isManualLogModalOpen = false)}
  onUpdate={() => {
    onUpdate();
    isManualLogModalOpen = false;
  }}
/>

<TimeLogDrawer
  isOpen={isDrawerOpen}
  log={selectedLog!}
  onClose={() => (isDrawerOpen = false)}
  onDelete={handleDelete}
/>

<div class="logs-section">
  <div class="logs-header">
    <button
      class="toggle-logs-btn"
      onclick={() => {
        try {
          selectionFeedback();
        } catch {}
        show = !show;
      }}
      transition:fade
    >
      {show ? "Hide" : "Show"} Time Logs
    </button>
  </div>

  {#if show && logs.length > 0}
    <div class="logs-container" transition:slide>
      <div class="logs-header">
        <h2>Time Logs</h2>
        {#if !readonly}
          <button
            class="add-manual-log-btn"
            onclick={() => {
              try {
                selectionFeedback();
              } catch {}
              isManualLogModalOpen = true;
            }}
            transition:fade
          >
            Add Manual Log
          </button>
        {/if}
      </div>
      <div class="logs-list">
        {#each logs as log (log.id)}
          <div
            class="log-item"
            class:readonly
            onclick={() => handleLogPress(log)}
          >
            <div class="log-date">
              {relativeTime.from(new Date(log.start_time))}
            </div>
            <div class="log-time">
              {new Date(log.start_time).toLocaleTimeString("en-GB")}
              <span class="log-time-separator">-</span>
              {new Date(
                log.end_time || new Date().getTime()
              ).toLocaleTimeString("en-GB")}
            </div>
            <div class="log-duration">
              {formatSeconds(
                ((log.end_time || new Date().getTime()) - log.start_time) / 1000
              )}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .logs-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    z-index: 1;
  }

  .toggle-logs-btn {
    align-self: center;
    padding: 0.5rem 1rem;
    background: var(--menu-color);
    border: 1px solid var(--surface-border-color);
    border-radius: 4px;
    color: var(--text-color);
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;

    &:hover {
      background: var(--surface-color);
      border-color: #2a9d8f;
    }
  }

  .logs-container {
    margin-top: 0;
    padding: 0.75rem;
    background: var(--surface-color);
    border: 1px solid var(--surface-border-color);
    border-radius: 8px;
    max-height: 300px;
    overflow-y: auto;
    z-index: 1;

    @media (min-width: 640px) {
      padding: 1rem;
    }

    .logs-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 0 0 1rem 0;

      h2 {
        font-size: 1.2rem;
        margin: 0;
        color: var(--text-color);
      }
    }
  }

  .logs-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .log-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    background: var(--menu-color);
    border: 1px solid var(--surface-border-color);
    border-radius: 4px;
    cursor: pointer;

    &.readonly {
      cursor: default;
    }

    @media (min-width: 640px) {
      flex-direction: row;
      gap: 1rem;
      align-items: center;
      justify-content: space-between;

      .log-date {
        flex: 1;
      }

      .log-time {
        flex: 2;
      }

      .log-duration {
        flex: 1;
      }
    }

    .log-date {
      color: var(--text-color-secondary);
      font-size: 0.9rem;
    }

    .log-time {
      text-align: left;
      color: var(--text-color);

      @media (min-width: 640px) {
        text-align: center;
      }
    }

    .log-duration {
      text-align: left;
      font-weight: 500;
      color: #2a9d8f;

      @media (min-width: 640px) {
        text-align: right;
      }
    }

    .log-time-separator {
      opacity: 0.5;
    }
  }

  .logs-header {
    display: flex;
    gap: 1rem;
    justify-content: center;
    align-items: center;
  }

  .add-manual-log-btn {
    padding: 0.5rem 1rem;
    background: #2a9d8f;
    border: 1px solid #2a9d8f;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;

    &:hover {
      background: #238779;
    }
  }
</style>
