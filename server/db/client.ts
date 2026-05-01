import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

let drizzleSingleton: ReturnType<typeof drizzle<typeof schema>> | null = null

export function getDb() {
  if (!drizzleSingleton) {
    const conf = useRuntimeConfig()
    const relativePath = String(conf.databasePath || './data/mission-control.db')
    const absolutePath = resolveRelativeDbPath(relativePath)
    mkdirSync(dirname(absolutePath), { recursive: true })
    const sqlite = new Database(absolutePath)
    drizzleSingleton = drizzle(sqlite, { schema })
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS logs (
        id TEXT PRIMARY KEY NOT NULL,
        agent_id TEXT,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        metadata_json TEXT,
        created_at TEXT NOT NULL
      );
    `)
  }
  return drizzleSingleton
}

function resolveRelativeDbPath(relativePath: string): string {
  const trimmed = relativePath.replace(/^file:/, '')
  return resolve(process.cwd(), trimmed)
}
