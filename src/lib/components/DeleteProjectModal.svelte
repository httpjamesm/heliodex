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
    onConfirm: () => void;
    onClose: () => void;
  } = $props();
</script>

<Modal
  title="Delete Project"
  {isOpen}
  {onClose}
  {onConfirm}
  confirmText="Delete"
>
  <p>
    Are you sure you want to delete "{projectName}"? This action cannot be
    undone.
  </p>
</Modal>

<style lang="scss">
  .delete-project-modal {
    h2 {
      margin: 0 0 1rem;
      font-size: 1.5rem;
      font-weight: 500;
    }

    p {
      margin: 0 0 1.5rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }
  }
</style>
