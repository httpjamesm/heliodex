<script lang="ts">
  type MenuItem = {
    icon: any;
    label: string;
    onClick: () => void;
    variant?: "default" | "danger";
  };

  const { items }: { items: MenuItem[] } = $props();
</script>

<div class="menu-items">
  {#each items as item}
    <button
      class="menu-item"
      class:danger={item.variant === "danger"}
      onclick={item.onClick}
    >
      <svelte:component this={item.icon} />
      <span>{item.label}</span>
    </button>
  {/each}
</div>

<style lang="scss">
  .menu-items {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border: none;
    border-radius: 0.5rem;
    background-color: var(--surface-color);
    color: var(--text-color);
    cursor: pointer;
    font-size: 1rem;
    text-align: left;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--surface-hover-color);
    }

    &.danger {
      color: #ef4444;
    }
  }
</style>
