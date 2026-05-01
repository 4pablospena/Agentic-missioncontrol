import { randomUUID } from 'node:crypto'
import { desc, eq } from 'drizzle-orm'
import type { Alert, AlertSeverity } from '~/models/alert'
import { alerts } from '../db/schema'
import { getDb } from '../db/client'

export async function listAlerts(limit = 100): Promise<Alert[]> {
  const rows = getDb()
    .select()
    .from(alerts)
    .orderBy(desc(alerts.createdAt))
    .limit(Math.min(Math.max(limit, 1), 500))
    .all()
  return rows.map(mapRow)
}

export async function acknowledgeAlert(id: string): Promise<Alert | null> {
  const db = getDb()
  const existing = db.select().from(alerts).where(eq(alerts.id, id)).get()
  if (!existing)
    return null
  db.update(alerts).set({ acknowledged: true }).where(eq(alerts.id, id)).run()
  const row = db.select().from(alerts).where(eq(alerts.id, id)).get()
  return row ? mapRow(row) : null
}

export interface CreateAlertInput {
  agentId?: string
  severity: AlertSeverity
  title: string
  message: string
  acknowledged?: boolean
}

export async function createAlertEntry(input: CreateAlertInput): Promise<Alert> {
  const id = randomUUID()
  const createdAt = new Date().toISOString()
  const db = getDb()
  db.insert(alerts).values({
    id,
    agentId: input.agentId ?? null,
    severity: input.severity,
    title: input.title,
    message: input.message,
    acknowledged: input.acknowledged ?? false,
    createdAt,
  }).run()
  const row = db.select().from(alerts).where(eq(alerts.id, id)).get()
  if (!row)
    throw new Error('Failed to persist alert')
  return mapRow(row)
}

function mapRow(row: typeof alerts.$inferSelect): Alert {
  return {
    id: row.id,
    agentId: row.agentId ?? undefined,
    severity: row.severity as AlertSeverity,
    title: row.title,
    message: row.message,
    acknowledged: row.acknowledged,
    createdAt: row.createdAt,
  }
}
