<script lang="ts">
  import HomeArc from "$lib/components/HomeArc.svelte";
  import ProjectCard from "$lib/components/ProjectCard.svelte";
  import BarChart from "$lib/components/BarChart.svelte";
  import type { Project } from "$lib/db/migrations";
  import { getActiveLog, getProjects } from "$lib/db/migrations";
  import { onMount } from "svelte";
  import { selectionFeedback } from "@tauri-apps/plugin-haptics";
  import { goto } from "$app/navigation";
  import { Pages } from "$lib/pages";
  import {
    activeLogId,
    isTracking,
    activeProjectId,
  } from "$lib/stores/project";

  let recentProjects = $state<Project[]>([]);

  //   get projects list and trim
  onMount(async () => {
    const projects = await getProjects();
    recentProjects = projects.slice(0, 3);
  });
</script>

<div class="home-arc-container">
  <HomeArc></HomeArc>
</div>

<div class="wrapper">
  <div class="container">
    <h1>Let's get some<br />work done.</h1>
    <div class="chart-container">
      <BarChart projects={recentProjects}></BarChart>
    </div>
    <div class="project-list">
      {#each recentProjects as project (project.id)}
        <ProjectCard
          id={project.id}
          name={project.name}
          refreshProjects={getProjects}
          disableDrawer
          archived={false}
          onclick={async () => {
            try {
              selectionFeedback();
            } catch {}
            activeProjectId.set(project.id);
            const activeLog = await getActiveLog(project.id);
            if (activeLog) {
              activeLogId.set(activeLog.id);
              isTracking.set(true);
            } else {
              activeLogId.set(null);
              isTracking.set(false);
            }
            goto(Pages.Track);
          }}
        />
      {/each}
    </div>
  </div>
</div>

<style lang="scss">
  .home-arc-container {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
  }

  .wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 1;
    padding: 2rem;
    box-sizing: border-box;

    .container {
      h1 {
        font-weight: 500;
        font-size: 48px;
        line-height: 45px;
        letter-spacing: -0.05em;
      }

      .project-list {
        padding-bottom: 2rem;
      }
    }
  }

  .chart-container {
    margin: 2rem 0;
  }
</style>
