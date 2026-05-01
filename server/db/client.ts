import { existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { join } from 'pathe'
import * as schema from './schema'

let drizzleSingleton: ReturnType<typeof drizzle<typeof schema>> | null = null

export function getDb() {
  if (!drizzleSingleton) {
    const conf = useRuntimeConfig()
    const relativePath = String(conf.databasePath || './data/mission-control.db')
    const absolutePath = resolveRelativeDbPath(relativePath)
    mkdirSync(dirname(absolutePath), { recursive: true })
    const sqlite = new Database(absolutePath)
    try {
      const db = drizzle(sqlite, { schema })
      const migrationsFolder = resolveMigrationsFolder()
      if (migrationsFolder)
        migrate(db, { migrationsFolder })
      drizzleSingleton = db
    }
    catch (e) {
      sqlite.close()
      throw e
    }
  }
  return drizzleSingleton
}

function resolveMigrationsFolder(): string | null {
  /** Prefer repo `server/db/migrations` so `nuxt build && node .output/...` never applies stale SQL copied under `.output` from an older build. */
  const candidates = [
    join(process.cwd(), 'server/db/migrations'),
    join(process.cwd(), '.output/server/db/migrations'),
  ]
  for (const folder of candidates) {
    if (existsSync(join(folder, 'meta', '_journal.json')))
      return folder
  }
  return null
}

function resolveRelativeDbPath(relativePath: string): string {
  const trimmed = relativePath.replace(/^file:/, '')
  return resolve(process.cwd(), trimmed)
}
