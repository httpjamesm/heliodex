<script lang="ts">
  import Wave from "$lib/components/Wave.svelte";

  let isWorking = $state(false);
  let startTime: Date | null = $state(null);
  let secsElapsed = $state(0);
  let elapsedInterval: number | null = $state(null);

  const toggleWorking = () => {
    isWorking = !isWorking;
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
  };

  $effect(() => {
    if (isWorking) {
      document.title = "Working - Track";
    } else {
      document.title = "Paused - Track";
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
  <button
    class="track-button"
    class:working={isWorking}
    onclick={toggleWorking}
  >
    <div class="button-content">
      <div class="button-content-inner">
        <span class="status-text">
          {isWorking
            ? workStatusTexts[
                Math.floor(Math.random() * workStatusTexts.length)
              ]
            : "Paused"}
        </span>
        {#if secsElapsed > 0}
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
    /* text-transform: uppercase; */
    /* letter-spacing: 0.1em; */

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

  .track-button:hover {
    transform: scale(1.02);
  }

  .track-button:active {
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
