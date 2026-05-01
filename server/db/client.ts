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
    drizzleSingleton = drizzle(sqlite, { schema })

    const migrationsFolder = resolveMigrationsFolder()
    if (migrationsFolder)
      migrate(drizzleSingleton, { migrationsFolder })
  }
  return drizzleSingleton
}

function resolveMigrationsFolder(): string | null {
  const candidates = [
    join(process.cwd(), '.output/server/db/migrations'),
    join(process.cwd(), 'server/db/migrations'),
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
