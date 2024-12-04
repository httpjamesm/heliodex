<script lang="ts">
  import HomeArc from "$lib/components/HomeArc.svelte";
  import ProjectCard from "$lib/components/ProjectCard.svelte";
  import BarChart from "$lib/components/BarChart.svelte";
  import type { Project } from "$lib/db/migrations";
  import { getProjects } from "$lib/db/migrations";
  import { onMount } from "svelte";
  import Wave from "$lib/components/Wave.svelte";
  import { goto } from "$app/navigation";
  import { spring } from "svelte/motion";
  import { Pages } from "$lib/pages";

  let scale = spring(1, { stiffness: 0.008, damping: 1 });
  let overlay = spring(0, { stiffness: 0.006, damping: 1 });
  let navigating = $state(false);
  let isExpanding = $state(false);

  const handleClick = async () => {
    if (navigating) return;
    navigating = true;
    isExpanding = true;
    window.localStorage.setItem("onboarding", "true");

    scale.set(40);
    overlay.set(1);

    await new Promise((resolve) => setTimeout(resolve, 750));
    goto(Pages.Home);
  };
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
      <strong>Keep track of it.</strong> Easily log your hours per project with the
      tap of a button.
    </h2>
    <div class="track-container">
      <button
        class="track-button working"
        on:click={handleClick}
        style:transform="scale({$scale})"
      >
        <div class="button-content">
          <div class="button-content-inner">
            {#if !isExpanding}
              <span class="status-text"> Start </span>
            {/if}
          </div>
        </div>
      </button>
    </div>

    <div class="wave-container">
      <Wave speed={3} color={"42, 157, 143"} />
    </div>
  </div>
</div>

<div
  class="overlay"
  style:opacity={$overlay}
  style:pointer-events={$overlay === 0 ? "none" : "all"}
></div>

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
    overflow: hidden;

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
    transition: opacity 0.3s ease;
    position: relative;
    overflow: hidden;
    padding: 3rem;
    box-sizing: border-box;
    z-index: 10;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .track-button.working {
    background-color: #2a9d8f;
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: #2a9d8f;
    z-index: 5;
    pointer-events: none;
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
</style>
