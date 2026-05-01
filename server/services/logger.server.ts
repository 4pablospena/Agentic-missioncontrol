import { randomUUID } from 'node:crypto'
import { desc } from 'drizzle-orm'
import type { LogEntry } from '~/models/log'
import { logs } from '../db/schema'
import { getDb } from '../db/client'

export interface CreateLogInput {
  agentId?: string
  level: LogEntry['level']
  message: string
  metadata?: Record<string, unknown>
}

export async function createLogEntry(input: CreateLogInput): Promise<LogEntry> {
  const row = {
    id: randomUUID(),
    agentId: input.agentId ?? null,
    level: input.level,
    message: input.message,
    metadataJson: input.metadata ? JSON.stringify(input.metadata) : null,
    createdAt: new Date().toISOString(),
  }
  const db = getDb()
  db.insert(logs).values({
    id: row.id,
    agentId: row.agentId,
    level: row.level,
    message: row.message,
    metadataJson: row.metadataJson,
    createdAt: row.createdAt,
  }).run()
  return {
    id: row.id,
    agentId: row.agentId ?? undefined,
    level: row.level,
    message: row.message,
    metadata: input.metadata,
    createdAt: row.createdAt,
  }
}

export async function listRecentLogs(limit = 50): Promise<LogEntry[]> {
  const db = getDb()
  const rows = db
    .select()
    .from(logs)
    .orderBy(desc(logs.createdAt))
    .limit(limit)
    .all()

  return rows.map(mapLogRowToLogEntry)
}

export function mapLogRowToLogEntry(row: (typeof logs)['$inferSelect']): LogEntry {
  let metadata: Record<string, unknown> | undefined
  if (row.metadataJson) {
    try {
      metadata = JSON.parse(row.metadataJson) as Record<string, unknown>
    }
    catch {
      metadata = undefined
    }
  }
  return {
    id: row.id,
    agentId: row.agentId ?? undefined,
    level: row.level as LogEntry['level'],
    message: row.message,
    metadata,
    createdAt: row.createdAt,
  }
}
