import Database from "@tauri-apps/plugin-sql";

export const migrations = [
  `CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS time_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    start_time INTEGER NOT NULL,
    end_time INTEGER,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  )`,
];

let db: Database;

export const initDatabase = async () => {
  db = await Database.load("sqlite:projects.db");
  for (const migration of migrations) {
    await db.execute(migration);
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
    "SELECT * FROM projects WHERE id = $1",
    [id]
  );
  return result[0];
};

export const getProjects = async () => {
  const result = await getDb().select<Project[]>("SELECT * FROM projects");
  return result;
};

export const addProject = async (name: string) => {
  const result = await getDb().execute(
    "INSERT INTO projects (name) VALUES ($1)",
    [name]
  );
  return result.lastInsertId;
};

export const updateProject = async (
  id: number,
  name: string,
  seconds: number
) => {
  await getDb().execute(
    "UPDATE projects SET name = $1, seconds = $2 WHERE id = $3",
    [name, seconds, id]
  );
};

export const deleteProject = async (id: number) => {
  await getDb().execute("DELETE FROM projects WHERE id = $1", [id]);
};

export const startTracking = async (project_id: number) => {
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

export type Project = {
  id: number;
  name: string;
};

export type TimeLog = {
  id: number;
  project_id: number;
  start_time: number;
  end_time: number | null;
};
