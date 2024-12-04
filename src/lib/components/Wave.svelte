<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  let width = $state(800);
  let height = $state(200);
  let amplitude = $state(30);
  let frequency = $state(0.005);
  let position = $state(0);
  let { speed, color }: { speed: number; color: string } = $props();

  const generateWavePaths = () => {
    // Generate the top wave line
    let topPath = `M -${width} ${height / 2}`;
    for (let x = -width; x <= 2 * width; x++) {
      const y = height / 2 + amplitude * Math.sin((x + position) * frequency);
      topPath += ` L ${x} ${y}`;
    }

    // Generate the fill path
    let fillPath = topPath; // Start with the top wave line
    fillPath += ` L ${2 * width} ${height} L -${width} ${height} Z`; // Add bottom rectangle

    return { topPath, fillPath };
  };

  let animationFrame = $state(0);

  const animate = () => {
    position += speed;
    if (position > 2 * width) position = 0;
    animationFrame = requestAnimationFrame(animate);
  };

  onMount(() => {
    animate();
  });

  onDestroy(() => {
    cancelAnimationFrame(animationFrame);
  });
</script>

<div class="wave-container">
  <svg viewBox="0 0 {width} {height}">
    <!-- Fill path without stroke -->
    <path
      d={generateWavePaths().fillPath}
      fill={`rgba(${color}, 0.2)`}
      stroke="none"
    />
    <!-- Top wave line with stroke -->
    <path
      d={generateWavePaths().topPath}
      fill="none"
      stroke={`rgba(${color}, 0.4)`}
      stroke-width="1.5"
    />
  </svg>
</div>

<style>
  .wave-container {
    width: 100%;
    height: fit-content;
    overflow: hidden;
    display: flex;
    align-items: flex-end;
  }

  svg {
    width: 100%;
    height: 100%;
  }
</style>
