<script lang="ts">
  const {
    size = 16,
    borderWidth = 2,
    color = "white",
    secondaryColor = "#b8b8b8",
  } = $props<{
    size?: number;
    borderWidth?: number;
    color?: string;
    secondaryColor?: string;
  }>();
</script>

<div
  class="spinner"
  style:width="{size}px"
  style:height="{size}px"
  style:border="{borderWidth}px solid {color}"
  style:border-top="{borderWidth}px solid {secondaryColor}"
></div>

<style lang="scss">
  .spinner {
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
