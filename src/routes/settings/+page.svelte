<script lang="ts">
  import { resetDatabase } from "$lib/db/migrations";
  import Modal from "$lib/components/Modal.svelte";
  import { goto } from "$app/navigation";

  let isResetModalOpen = $state(false);

  const handleReset = async () => {
    await resetDatabase();
    isResetModalOpen = false;
    goto("/");
  };
</script>

<div class="container">
  <div class="header">
    <h1>Settings</h1>
  </div>

  <div class="settings-grid">
    <div class="setting-group">
      <h2>Data Management</h2>
      <button class="danger" onclick={() => (isResetModalOpen = true)}>
        Reset App Data
      </button>
    </div>
  </div>

  <Modal
    title="Reset App Data"
    isOpen={isResetModalOpen}
    onClose={() => (isResetModalOpen = false)}
    onConfirm={handleReset}
    confirmText="Reset"
  >
    <p>
      Are you sure you want to reset all app data? This action cannot be undone.
    </p>
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

  .settings-grid {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .setting-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    h2 {
      font-size: 1.25rem;
      font-weight: 500;
      margin: 0;
      color: #666;
    }
  }

  button {
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    background-color: var(--surface-color);
    color: var(--text-color);

    &:hover {
      opacity: 0.8;
    }

    &.danger {
      background-color: #e63946;
      color: white;
    }
  }
</style>
