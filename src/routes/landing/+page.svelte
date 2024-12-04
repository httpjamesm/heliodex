<script lang="ts">
  import HomeArc from "$lib/components/HomeArc.svelte";
  import ProjectCard from "$lib/components/ProjectCard.svelte";
  import BarChart from "$lib/components/BarChart.svelte";
  import type { Project } from "$lib/db/migrations";
  import { getProjects } from "$lib/db/migrations";
  import { onMount } from "svelte";
  import Wave from "$lib/components/Wave.svelte";
  import { goto } from "$app/navigation";
</script>

<div class="home-arc-container">
  <!-- <HomeArc></HomeArc> -->
</div>

<div class="wrapper">
  <div class="container">
    <h1>
      <span class="time">Time</span> is your<br /><i>most</i> valuable<br
      />resource.
    </h1>
    <h2>
      <strong>Keep track of it.</strong> Import all your projects and log your hours
      simply with the tap of a button.
    </h2>
    <div class="track-container">
      <button
        class="track-button working"
        onclick={() => {
          window.localStorage.setItem("onboarding", "true");
          goto("/app");
        }}
      >
        <div class="button-content">
          <div class="button-content-inner">
            <span class="status-text"> Start </span>
          </div>
        </div>
      </button>
    </div>

    <div class="wave-container">
      <Wave speed={3} color={"42, 157, 143"} />
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
      display: flex;
      flex-direction: column;
      height: 100%;
      h1 {
        font-weight: 500;
        font-size: 48px;
        line-height: 45px;
        letter-spacing: -0.05em;
        color: var(--secondary-text-color);
        margin-bottom: 0;

        .time {
          color: var(--text-color);
        }
      }

      h2 {
        font-size: 24px;
        line-height: 30px;
        color: var(--text-color);
        font-weight: 400;
        letter-spacing: -0.05em;
      }
    }
  }

  .wave-container {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 0;
    width: 100%;
  }

  .track-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
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
</style>
