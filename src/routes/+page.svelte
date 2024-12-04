<script lang="ts">
  import HomeArc from "$lib/components/HomeArc.svelte";
  import ProjectCard from "$lib/components/ProjectCard.svelte";
</script>

<div class="home-arc-container">
  <HomeArc />
</div>

<div class="wrapper">
  <div class="container">
    <h1>Let's get some<br />work done.</h1>
    <ProjectCard name="Web Design Project" hours={5.34} />
    <ProjectCard name="Blindr Project" hours={23.19} />
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
        /* or 94% */
        letter-spacing: -0.05em;
      }
    }
  }
</style>
