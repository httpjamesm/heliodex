<script lang="ts">
  import Modal from "./Modal.svelte";

  const {
    isOpen = false,
    projectName,
    onConfirm,
    onClose,
  }: {
    isOpen: boolean;
    projectName: string;
    onConfirm: (newName: string) => void;
    onClose: () => void;
  } = $props();

  let newName = projectName;

  const handleSubmit = () => {
    if (newName.trim() && newName !== projectName) {
      onConfirm(newName.trim());
    }
    onClose();
  };
</script>

<Modal
  title="Rename Project"
  {isOpen}
  {onClose}
  onConfirm={handleSubmit}
  confirmText="Rename"
>
  <input
    type="text"
    bind:value={newName}
    placeholder="Enter new project name"
    autofocus
  />
</Modal>

<style lang="scss">
  .rename-project-modal {
    h2 {
      margin: 0 0 1rem;
      font-size: 1.5rem;
      font-weight: 500;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid var(--border-color);
      border-radius: 4px;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }
  }
</style>
