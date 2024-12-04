<script lang="ts">
  import Drawer from "./Drawer.svelte";
  import MenuItems from "./MenuItems.svelte";
  import { IconEdit, IconTrash } from "@tabler/icons-svelte";
  import DeleteProjectModal from "./DeleteProjectModal.svelte";
  import RenameProjectModal from "./RenameProjectModal.svelte";

  let {
    isOpen = false,
    name,
    onClose,
    onRename,
    onDelete,
  }: {
    isOpen: boolean;
    name: string;
    onClose: () => void;
    onRename: (newName: string) => void;
    onDelete: () => void;
  } = $props();

  let showRenameModal = $state(false);
  let showDeleteModal = $state(false);

  const menuItems = [
    {
      icon: IconEdit,
      label: "Rename Project",
      onClick: () => (showRenameModal = true),
    },
    {
      icon: IconTrash,
      label: "Delete Project",
      onClick: () => (showDeleteModal = true),
      variant: "danger" as const,
    },
  ];
</script>

<Drawer {isOpen} close={onClose}>
  <div class="project-drawer">
    <MenuItems items={menuItems} />
  </div>
</Drawer>

<DeleteProjectModal
  isOpen={showDeleteModal}
  projectName={name}
  onConfirm={() => {
    onDelete();
    showDeleteModal = false;
  }}
  onClose={() => (showDeleteModal = false)}
/>

<RenameProjectModal
  isOpen={showRenameModal}
  projectName={name}
  onConfirm={(newName) => {
    onRename(newName);
    showRenameModal = false;
  }}
  onClose={() => (showRenameModal = false)}
/>

<style lang="scss">
  .project-drawer {
    h2 {
      margin: 0 0 1.5rem;
      font-size: 1.5rem;
      font-weight: 500;
    }
  }
</style>
