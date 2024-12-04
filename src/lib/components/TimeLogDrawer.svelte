<script lang="ts">
  import Drawer from "./Drawer.svelte";
  import MenuItems from "./MenuItems.svelte";
  import type { TimeLog } from "$lib/db/migrations";
  import { IconTrash } from "@tabler/icons-svelte";

  let {
    isOpen,
    log,
    onClose,
    onDelete,
  }: {
    isOpen: boolean;
    log: TimeLog;
    onClose: () => void;
    onDelete: () => Promise<void>;
  } = $props();

  const menuItems = $derived([
    {
      icon: IconTrash,
      label: "Delete Time Log",
      onClick: onDelete,
      variant: "danger",
    },
  ]);
</script>

<Drawer {isOpen} close={onClose}>
  <div class="drawer-content">
    <MenuItems items={menuItems} />
  </div>
</Drawer>

<style lang="scss">
  .drawer-content {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    h2 {
      margin: 0;
      font-size: 1.2rem;
      color: var(--text-color);
    }
  }

  .time-details {
    background: var(--surface-color);
    padding: 1rem;
    border-radius: 8px;

    p {
      margin: 0.5rem 0;
      color: var(--text-secondary-color);
    }
  }
</style>
