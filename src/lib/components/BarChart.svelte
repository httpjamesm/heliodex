<script lang="ts">
  import type { Project } from "$lib/db/migrations";
  import { getProjectTimesForDate } from "$lib/db/migrations";
  import { fade } from "svelte/transition";
  import Spinner from "./Spinner.svelte";

  let { projects } = $props<{ projects: Project[] }>();
  let loading = $state(true);

  const getColorFromName = (name: string) => {
    const hash = Array.from(name).reduce(
      (acc, char) => char.charCodeAt(0) + ((acc << 5) - acc),
      0
    );

    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 50%)`;
  };

  interface TimeData {
    project: Project;
    hours: number;
    color: string;
  }

  interface DayData {
    date: string;
    projects: TimeData[];
    total: number;
  }

  let data = $state<DayData[]>([]);

  const dates = $derived(
    Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    })
  );

  const formattedDates = $derived(
    dates.map((date) => date.toLocaleDateString("en-US", { weekday: "short" }))
  );

  const loadData = async (projectsList: Project[]) => {
    loading = true;
    const days: DayData[] = [];

    for (let i = 0; i < 7; i++) {
      const dayData: DayData = {
        date: formattedDates[i],
        projects: [],
        total: 0,
      };

      const timesForDate = await getProjectTimesForDate(dates[i]);
      const projectTimes = new Map(
        timesForDate.map((t) => [t.project_id, t.total_seconds])
      );

      for (const project of projectsList) {
        const seconds = projectTimes.get(project.id) || 0;
        const hours = seconds / 3600;
        if (hours > 0) {
          dayData.projects.push({
            project,
            hours,
            color: getColorFromName(project.name),
          });
          dayData.total += hours;
        }
      }

      days.push(dayData);
    }

    data = days;
    loading = false;
  };

  $effect(() => {
    if (projects) {
      loadData(projects);
    }
  });
</script>

<div class="chart">
  {#if loading}
    <div class="loading" transition:fade={{ duration: 200 }}>
      <Spinner
        size={24}
        color="var(--text-color)"
        secondaryColor="var(--surface-border-color)"
      />
    </div>
  {:else}
    <div class="bars" transition:fade={{ duration: 200 }}>
      {#each data as day}
        <div class="bar-container">
          <div class="bar">
            {#if day.total > 0}
              {#each day.projects as timeData}
                <div
                  class="bar-segment"
                  style:background-color={timeData.color}
                  style:height={`${(timeData.hours / day.total) * 100}%`}
                ></div>
              {/each}
            {:else}
              <div class="no-data"></div>
            {/if}
          </div>
          <div class="label">{day.date}</div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .chart {
    position: relative;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    height: 200px;
    gap: 1rem;
    padding: 1rem;
    background: var(--surface-color);
    border: 1px solid var(--surface-border-color);
    border-radius: 0.5rem;
  }

  .bar-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    height: 100%;
  }

  .bar {
    width: 100%;
    height: calc(100% - 1.5rem);
    display: flex;
    flex-direction: column;
    align-items: stretch;
    border-radius: 4px;
    overflow: hidden;
  }

  .bar-segment {
    position: relative;
    transition: all 0.2s ease;

    &:hover {
      filter: brightness(1.2);
    }
  }

  .no-data {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-color);
    opacity: 0.5;
    font-size: 0.875rem;
    background: var(--menu-color);
  }

  .label {
    font-size: 0.875rem;
    color: var(--text-color);
    opacity: 0.7;
  }

  .loading {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bars {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    gap: 1rem;
  }
</style>
