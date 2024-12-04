<script lang="ts">
  import Drawer from "./Drawer.svelte";
  import MenuItems from "./MenuItems.svelte";
  import {
    IconEdit,
    IconTrash,
    IconArchive,
    IconArchiveOff,
  } from "@tabler/icons-svelte";
  import DeleteProjectModal from "./DeleteProjectModal.svelte";
  import RenameProjectModal from "./RenameProjectModal.svelte";

  let {
    isOpen = false,
    name,
    archived = false,
    onClose,
    onRename,
    onDelete,
    onArchive,
    onUnarchive,
  }: {
    isOpen: boolean;
    name: string;
    archived: boolean;
    onClose: () => void;
    onRename: (newName: string) => void;
    onDelete: () => void;
    onArchive: () => void;
    onUnarchive: () => void;
  } = $props();

  let showRenameModal = $state(false);
  let showDeleteModal = $state(false);

  let menuItems = $derived([
    {
      icon: IconEdit,
      label: "Rename Project",
      onClick: () => (showRenameModal = true),
    },
    {
      icon: archived ? IconArchiveOff : IconArchive,
      label: archived ? "Unarchive Project" : "Archive Project",
      onClick: archived ? onUnarchive : onArchive,
    },
    {
      icon: IconTrash,
      label: "Delete Project",
      onClick: () => (showDeleteModal = true),
      variant: "danger" as const,
    },
  ]);
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
