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
