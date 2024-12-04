<script lang="ts">
  import { createTimeLog } from "$lib/db/migrations";
  import Modal from "./Modal.svelte";

  let {
    isOpen,
    onClose,
    onUpdate,
    projectId,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    projectId: number;
  } = $props();

  const formatDateForInput = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  let startTime = $state(formatDateForInput(new Date()));
  let endTime = $state(formatDateForInput(new Date()));

  const handleSubmit = async () => {
    await createTimeLog({
      project_id: projectId,
      start_time: new Date(startTime).getTime(),
      end_time: new Date(endTime).getTime(),
    });
    onUpdate();
  };
</script>

<Modal
  {isOpen}
  {onClose}
  onConfirm={handleSubmit}
  title="Add Manual Time Log"
  confirmText="Add Log"
>
  <div class="form-group">
    <label for="start-time">Start Time</label>
    <input
      type="datetime-local"
      id="start-time"
      bind:value={startTime}
      required
    />
  </div>
  <br />
  <div class="form-group">
    <label for="end-time">End Time</label>
    <input type="datetime-local" id="end-time" bind:value={endTime} required />
  </div>
</Modal>

<style lang="scss">
</style>
