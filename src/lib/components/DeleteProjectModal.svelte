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
  <div class="delete-project-modal">
    <p>
      Are you sure you want to delete "{projectName}"? This action cannot be
      undone.
    </p>
  </div>
</Modal>

<style lang="scss">
  .delete-project-modal {
    p {
      margin: 0 0 1.5rem;
      word-break: break-word;
    }
  }
</style>
