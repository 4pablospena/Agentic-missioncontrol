import { randomUUID } from 'node:crypto'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import type { LogFilters } from '~/models/log-filters'
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

export type ListLogsOptions = LogFilters & {
  limit?: number
}

export async function listLogs(options: ListLogsOptions = {}): Promise<LogEntry[]> {
  const rawLimit = options.limit ?? 100
  const limit = Math.min(Math.max(rawLimit, 1), 500)
  const db = getDb()
  const conditions = []

  if (options.agentId?.trim())
    conditions.push(eq(logs.agentId, options.agentId.trim()))

  if (options.level)
    conditions.push(eq(logs.level, options.level))

  if (options.query?.trim()) {
    const needle = options.query.trim().toLowerCase()
    conditions.push(sql`instr(lower(${logs.message}), ${needle}) > 0`)
  }

  if (options.from?.trim())
    conditions.push(gte(logs.createdAt, options.from.trim()))

  if (options.to?.trim())
    conditions.push(lte(logs.createdAt, options.to.trim()))

  if (options.sessionId?.trim()) {
    const sid = options.sessionId.trim()
    conditions.push(
      sql`(json_extract(${logs.metadataJson}, '$.sessionId') = ${sid} OR json_extract(${logs.metadataJson}, '$.session_id') = ${sid})`,
    )
  }

  if (options.taskId?.trim()) {
    const tid = options.taskId.trim()
    conditions.push(sql`json_extract(${logs.metadataJson}, '$.taskId') = ${tid}`)
  }

  const qb = db.select().from(logs).orderBy(desc(logs.createdAt)).limit(limit)
  const rows = conditions.length > 0 ? qb.where(and(...conditions)).all() : qb.all()

  return rows.map(mapLogRowToLogEntry)
}

export async function listRecentLogs(limit = 50): Promise<LogEntry[]> {
  return listLogs({ limit })
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
