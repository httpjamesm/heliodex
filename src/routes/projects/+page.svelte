<script lang="ts">
  import { IconPlus, IconSearch } from "@tabler/icons-svelte";
  import ProjectCard from "$lib/components/ProjectCard.svelte";
  import FAB from "$lib/components/FAB.svelte";
  let searchQuery = $state("");
  let projects = $state([
    { name: "Web Design Project", hours: 5.34 },
    { name: "Blindr Project", hours: 23.19 },
  ]);

  let filteredProjects = $derived(
    projects.filter((project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const addProject = () => {
    projects = [...projects, { name: "New Project", hours: 0 }];
  };
</script>

<div class="container">
  <div class="header">
    <h1>Projects</h1>
  </div>

  <div class="search-container">
    <IconSearch size={20} />
    <input
      type="text"
      placeholder="Search projects..."
      bind:value={searchQuery}
    />
  </div>

  <div class="projects-grid">
    {#each filteredProjects as project}
      <ProjectCard name={project.name} hours={project.hours} />
    {/each}
  </div>

  <FAB icon={IconPlus} onclick={addProject} />
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

  .search-container {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background-color: var(--surface-color);
    border: 1px solid var(--surface-border-color);
    border-radius: 0.5rem;
    color: var(--text-color);

    input {
      flex: 1;
      background: none;
      border: none;
      color: var(--text-color);
      font-size: 1rem;
      outline: none;

      &::placeholder {
        color: rgba(244, 244, 244, 0.5);
      }
    }
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .fab {
    position: fixed;
    bottom: 6.5rem;
    right: 2rem;
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 50%;
    background-color: #2a9d8f;
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(42, 157, 143, 0.2);
    }

    &:active {
      transform: translateY(0);
    }
  }
</style>
