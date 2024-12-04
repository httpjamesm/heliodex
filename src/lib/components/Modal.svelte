<script lang="ts">
  import { IconX } from "@tabler/icons-svelte";
  import type { Snippet } from "svelte";
  import { fade, fly } from "svelte/transition";
  import Spinner from "./Spinner.svelte";

  const {
    title,
    isOpen,
    onClose,
    onConfirm,
    confirmText,
    children,
  }: {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    confirmText?: string;
    children: Snippet;
  } = $props();

  let isLoading = $state(false);

  const handleConfirm = async () => {
    isLoading = true;
    try {
      await onConfirm();
    } finally {
      isLoading = false;
    }
  };
</script>

{#if isOpen}
  <div class="modal-backdrop" transition:fade>
    <div class="modal" in:fly={{ y: 100 }} out:fly={{ y: 100 }}>
      <div class="modal-header">
        <h2>{title}</h2>
        <button class="close-button" onclick={onClose}>
          <IconX size={20} />
        </button>
      </div>
      <div class="modal-content">
        {@render children?.()}
      </div>
      <div class="modal-actions">
        <button class="cancel" onclick={onClose}>Cancel</button>
        <button class="confirm" onclick={handleConfirm} disabled={isLoading}>
          <span>
            {confirmText ?? "Confirm"}
          </span>
          {#if isLoading}
            <Spinner size={16} />
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background-color: var(--surface-color);
    border: 1px solid var(--surface-border-color);
    border-radius: 0.5rem;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    box-sizing: border-box;
    border-bottom: 1px solid var(--surface-border-color);

    h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 500;
    }
  }

  .close-button {
    background: none;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    padding: 0.25rem;
    box-sizing: border-box;
    border-radius: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: rgba(244, 244, 244, 0.1);
    }
  }

  .modal-content {
    padding: 1rem;
    box-sizing: border-box;
    width: 100%;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1rem;
    box-sizing: border-box;
    border-top: 1px solid var(--surface-border-color);

    button {
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      &.cancel {
        background: none;
        border: 1px solid var(--surface-border-color);
        color: var(--text-color);

        &:hover {
          background-color: rgba(244, 244, 244, 0.1);
        }
      }

      &.confirm {
        background-color: #2a9d8f;
        border: none;
        color: white;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        &:hover {
          background-color: #238b7e;
        }
      }
    }
  }

  .primary {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
</style>
