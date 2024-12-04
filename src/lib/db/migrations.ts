import Database from "@tauri-apps/plugin-sql";

export const migrations = [
  {
    version: 1,
    sql: `CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY
    )`,
  },
  {
    version: 2,
    sql: `CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )`,
  },
  {
    version: 3,
    sql: `CREATE TABLE IF NOT EXISTS time_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      start_time INTEGER NOT NULL,
      end_time INTEGER,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )`,
  },
  {
    version: 4,
    sql: `ALTER TABLE projects ADD COLUMN archived INTEGER NOT NULL DEFAULT 0`,
  },
];

let db: Database;

export const getCurrentVersion = async (): Promise<number> => {
  try {
    const result = await db.select<{ version: number }[]>(
      "SELECT version FROM schema_version ORDER BY version DESC LIMIT 1"
    );
    return result[0]?.version ?? 0;
  } catch {
    return 0;
  }
};

export const setVersion = async (version: number): Promise<void> => {
  await db.execute(
    "INSERT OR REPLACE INTO schema_version (version) VALUES ($1)",
    [version]
  );
};

export const initDatabase = async () => {
  db = await Database.load("sqlite:projects.db");

  const currentVersion = await getCurrentVersion();
  const pendingMigrations = migrations.filter(
    (m) => m.version > currentVersion
  );

  for (const migration of pendingMigrations) {
    await db.execute(migration.sql);
    await setVersion(migration.version);
  }

  return db;
};

export const getDb = () => {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first");
  }
  return db;
};

export const getProject = async (id: number) => {
  const result = await getDb().select<Project[]>(
    "SELECT id, name, archived != 0 as archived FROM projects WHERE id = $1",
    [id]
  );
  return result[0];
};

export const getProjects = async (includeArchived = false) => {
  const result = await getDb().select<Project[]>(
    "SELECT id, name, archived != 0 as archived FROM projects WHERE archived = 0 OR archived = $1 ORDER BY archived, name",
    [includeArchived ? 1 : 0]
  );
  return result;
};

export const addProject = async (name: string) => {
  const result = await getDb().execute(
    "INSERT INTO projects (name, archived) VALUES ($1, 0)",
    [name]
  );
  return result.lastInsertId;
};

export const updateProject = async (id: number, name: string) => {
  await getDb().execute("UPDATE projects SET name = $1 WHERE id = $2", [
    name,
    id,
  ]);
};

export const deleteProject = async (id: number) => {
  await getDb().execute("DELETE FROM projects WHERE id = $1", [id]);
};

export const startTracking = async (project_id: number) => {
  const project = await getProject(project_id);
  if (project?.archived) {
    throw new Error("Cannot track time for archived projects");
  }
  const result = await getDb().execute(
    "INSERT INTO time_logs (project_id, start_time) VALUES ($1, $2)",
    [project_id, Date.now()]
  );
  return result.lastInsertId;
};

export const stopTracking = async (log_id: number) => {
  await getDb().execute("UPDATE time_logs SET end_time = $1 WHERE id = $2", [
    Date.now(),
    log_id,
  ]);
};

export const getProjectLogs = async (project_id: number) => {
  const result = await getDb().select<TimeLog[]>(
    "SELECT * FROM time_logs WHERE project_id = $1 ORDER BY start_time DESC",
    [project_id]
  );
  return result;
};

export const getProjectElapsedTime = async (project_id: number) => {
  const result = await getDb().select<{ total_seconds: number }[]>(
    `SELECT COALESCE(SUM(
      CASE 
        WHEN end_time IS NULL THEN (strftime('%s', 'now') * 1000 - start_time) / 1000
        ELSE (end_time - start_time) / 1000
      END
    ), 0) as total_seconds
    FROM time_logs 
    WHERE project_id = $1`,
    [project_id]
  );
  return Math.floor(result[0].total_seconds);
};

export const getActiveLog = async (project_id: number) => {
  const result = await getDb().select<TimeLog[]>(
    "SELECT * FROM time_logs WHERE project_id = $1 AND end_time IS NULL",
    [project_id]
  );
  return result[0] || null;
};

export const getProjectTimeForDate = async (project_id: number, date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const result = await getDb().select<{ total_seconds: number }[]>(
    `SELECT COALESCE(SUM(
      CASE 
        WHEN end_time IS NULL THEN (strftime('%s', 'now') * 1000 - start_time) / 1000
        ELSE (end_time - start_time) / 1000
      END
    ), 0) as total_seconds
    FROM time_logs 
    WHERE project_id = $1 
    AND start_time >= $2 
    AND start_time <= $3`,
    [project_id, startOfDay.getTime(), endOfDay.getTime()]
  );
  return Math.floor(result[0].total_seconds);
};

export const getProjectTimesForDate = async (date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const result = await getDb().select<
    { project_id: number; total_seconds: number }[]
  >(
    `SELECT 
      project_id,
      COALESCE(SUM(
        CASE 
          WHEN end_time IS NULL THEN (strftime('%s', 'now') * 1000 - start_time) / 1000
          ELSE (end_time - start_time) / 1000
        END
      ), 0) as total_seconds
    FROM time_logs 
    WHERE start_time >= $1 
    AND start_time <= $2
    GROUP BY project_id`,
    [startOfDay.getTime(), endOfDay.getTime()]
  );
  return result;
};

export const renameProject = async (id: number, name: string) => {
  await getDb().execute("UPDATE projects SET name = $1 WHERE id = $2", [
    name,
    id,
  ]);
};

export const resetDatabase = async () => {
  await getDb().execute("DELETE FROM time_logs");
  await getDb().execute("DELETE FROM projects");
};

export const hasOpenTimeLog = async (projectId: number): Promise<boolean> => {
  const db = getDb();
  const result = await db.select<{ count: number }[]>(
    "SELECT COUNT(*) as count FROM time_logs WHERE project_id = $1 AND end_time IS NULL",
    [projectId]
  );
  return result[0].count > 0;
};

export const deleteTimeLog = async (id: number): Promise<void> => {
  await getDb().execute("DELETE FROM time_logs WHERE id = $1", [id]);
};

export const archiveProject = async (id: number) => {
  await getDb().execute("UPDATE projects SET archived = 1 WHERE id = $1", [id]);
  //   stop tracking this project as well
  const hasOpenLog = await hasOpenTimeLog(id);
  if (hasOpenLog) {
    const openLog = await getActiveLog(id);
    if (openLog) {
      await stopTracking(openLog.id);
    }
  }
};

export const unarchiveProject = async (id: number) => {
  await getDb().execute("UPDATE projects SET archived = 0 WHERE id = $1", [id]);
};

export const createTimeLog = async (timeLog: {
  project_id: number;
  start_time: number;
  end_time: number;
}) => {
  const db = await getDb();
  const result = await db.select<TimeLog[]>(
    "INSERT INTO time_logs (project_id, start_time, end_time) VALUES ($1, $2, $3) RETURNING *",
    [timeLog.project_id, timeLog.start_time, timeLog.end_time]
  );
  return result[0];
};

export type Project = {
  id: number;
  name: string;
  archived: boolean;
};

export type TimeLog = {
  id: number;
  project_id: number;
  start_time: number;
  end_time: number | null;
};
