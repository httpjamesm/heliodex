<script lang="ts">
  import { IconPlus, IconSearch } from "@tabler/icons-svelte";
  import ProjectCard from "$lib/components/ProjectCard.svelte";
  import FAB from "$lib/components/FAB.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import { getProjects, addProject, type Project } from "$lib/db/migrations";

  let searchQuery = $state("");
  let projects = $state<Project[]>([]);
  let isModalOpen = $state(false);
  let newProjectName = $state("");

  let filteredProjects = $derived(
    projects.filter((project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const loadProjects = async () => {
    projects = await getProjects();
  };

  const handleAddProject = async () => {
    if (!newProjectName.trim()) return;
    await addProject(newProjectName);
    await loadProjects();
    newProjectName = "";
    isModalOpen = false;
  };

  $effect(() => {
    loadProjects();
  });
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
      <ProjectCard name={project.name} hours={project.seconds / 3600} />
    {/each}
  </div>

  <FAB icon={IconPlus} onclick={() => (isModalOpen = true)} />

  <Modal
    title="New Project"
    isOpen={isModalOpen}
    onClose={() => (isModalOpen = false)}
    onConfirm={handleAddProject}
    confirmText="Create"
  >
    <input
      type="text"
      placeholder="Enter project name"
      bind:value={newProjectName}
      class="project-name-input"
    />
  </Modal>
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
      width: 100%;

      &::placeholder {
        color: rgba(244, 244, 244, 0.5);
      }
    }
  }

  .project-name-input {
    width: 100%;
    padding: 0.75rem;
    background-color: var(--surface-color);
    border: 1px solid var(--surface-border-color);
    border-radius: 0.25rem;
    color: var(--text-color);
    font-size: 1rem;
    outline: none;
    box-sizing: border-box;

    &:focus {
      border-color: #2a9d8f;
    }

    &::placeholder {
      color: rgba(244, 244, 244, 0.5);
    }
  }
</style>
