<script lang="ts">
  import { resetDatabase, getDb, type TimeLog } from "$lib/db/migrations";
  import Modal from "$lib/components/Modal.svelte";
  import { goto } from "$app/navigation";
  import { save } from "@tauri-apps/plugin-dialog";
  import { writeTextFile, BaseDirectory } from "@tauri-apps/plugin-fs";

  let isResetModalOpen = $state(false);
  let isImportModalOpen = $state(false);
  let importData = $state("");
  let importError = $state("");

  const handleReset = async () => {
    await resetDatabase();
    isResetModalOpen = false;
    goto("/");
  };

  const handleImport = async () => {
    try {
      importError = "";
      const lines = importData.trim().split("\n");

      if (lines[0].toLowerCase() !== "project,start,end") {
        throw new Error(
          "Invalid CSV format. First line must be 'project,start,end'"
        );
      }

      const db = getDb();
      const projects = new Map<string, number>();

      for (const line of lines.slice(1)) {
        const [project, start, end] = line.split(",").map((x) => x.trim());
        const startTime = parseInt(start) * 1000;
        const endTime = parseInt(end) * 1000;

        if (!project) {
          throw new Error("Project name is required");
        }
        if (isNaN(startTime) || isNaN(endTime)) {
          throw new Error("Invalid timestamp format");
        }

        let projectId: number;
        if (projects.has(project)) {
          projectId = projects.get(project)!;
        } else {
          const result = await db.execute(
            "INSERT INTO projects (name) VALUES ($1)",
            [project]
          );
          projectId = result.lastInsertId;
          projects.set(project, projectId);
        }

        await db.execute(
          "INSERT INTO time_logs (project_id, start_time, end_time) VALUES ($1, $2, $3)",
          [projectId, startTime, endTime]
        );
      }

      isImportModalOpen = false;
      importData = "";
      goto("/projects");
    } catch (error) {
      importError = error instanceof Error ? error.message : "Import failed";
    }
  };

  const handleExport = async () => {
    try {
      const db = getDb();
      const timeLogs = await db.select<{
        project_name: string;
        start_time: number;
        end_time: number;
      }>(
        `SELECT p.name as project_name, t.start_time, t.end_time 
         FROM time_logs t 
         JOIN projects p ON t.project_id = p.id 
         ORDER BY t.start_time`
      );

      const csvContent = [
        "project,start,end",
        ...timeLogs.map(
          (log) =>
            `${log.project_name},${Math.floor(log.start_time / 1000)},${Math.floor(
              log.end_time / 1000
            )}`
        ),
      ].join("\n");

      const filePath = await save({
        defaultPath: `time_logs_${new Date().toISOString().split("T")[0]}.csv`,
        filters: [
          {
            name: "CSV Files",
            extensions: ["csv"],
          },
        ],
      });

      if (filePath) {
        await writeTextFile(filePath, csvContent);
      }
    } catch (error) {
      console.error("Failed to export:", error);
    }
  };
</script>

<div class="container">
  <div class="header">
    <h1>Settings</h1>
  </div>

  <div class="settings-grid">
    <div class="setting-group">
      <h2>Data Management</h2>
      <button class="danger" on:click={() => (isResetModalOpen = true)}>
        Reset App Data
      </button>
      <button on:click={() => (isImportModalOpen = true)}>
        Import Time Logs
      </button>
      <button on:click={handleExport}> Export Time Logs </button>
    </div>
  </div>

  <Modal
    title="Reset App Data"
    isOpen={isResetModalOpen}
    onClose={() => (isResetModalOpen = false)}
    onConfirm={handleReset}
    confirmText="Reset"
  >
    <p>
      Are you sure you want to reset all app data? This action cannot be undone.
    </p>
  </Modal>

  <Modal
    title="Import Time Logs"
    isOpen={isImportModalOpen}
    onClose={() => (isImportModalOpen = false)}
    onConfirm={handleImport}
    confirmText="Import"
  >
    <div class="import-container">
      <p>
        Paste your CSV data below. The CSV should have three columns: "project",
        "start", and "end", containing Unix timestamps in seconds.
      </p>
      <textarea
        bind:value={importData}
        placeholder="project,start,end
Project A,1677123456,1677127056
Project A,1677134567,1677138167
Project B,1677145678,1677149278"
        rows="10"
      ></textarea>
      {#if importError}
        <p class="error">{importError}</p>
      {/if}
    </div>
  </Modal>
</div>

<style lang="scss">
  .container {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    position: relative;
    height: 100%;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h1 {
      font-size: 2rem;
      font-weight: 500;
      margin: 0;
    }
  }

  .settings-grid {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .setting-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    h2 {
      font-size: 1.25rem;
      font-weight: 500;
      margin: 0;
      color: #666;
    }
  }

  .import-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    textarea {
      width: 100%;
      padding: 0.5rem;
      border-radius: 0.25rem;
      border: 1px solid #ccc;
      font-family: monospace;
      resize: vertical;
    }
  }

  .error {
    color: #e63946;
    font-size: 0.875rem;
    margin: 0;
  }

  button {
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    background-color: var(--surface-color);
    color: var(--text-color);

    &:hover {
      opacity: 0.8;
    }

    &.danger {
      background-color: #e63946;
      color: white;
    }
  }
</style>
