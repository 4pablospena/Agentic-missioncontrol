import Database from 'better-sqlite3'

/**
 * Forces a task row into `failed` so HTTP retry can be exercised.
 * Run while Nitro holds the DB open (SQLite allows this for quick updates).
 */
export function seedTaskFailed(dbPath: string, taskId: string): void {
  const db = new Database(dbPath)
  const ts = new Date().toISOString()
  db.prepare(
    `UPDATE tasks
     SET status = 'failed',
         error = 'integration seed',
         completed_at = ?,
         updated_at = ?,
         progress = 50
     WHERE id = ?`,
  ).run(ts, ts, taskId)
  db.close()
}
