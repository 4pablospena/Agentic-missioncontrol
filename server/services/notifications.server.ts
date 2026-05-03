import { randomUUID } from 'node:crypto'
import { and, desc, eq, sql } from 'drizzle-orm'
import type { Notification, NotificationSeverity, NotificationStatusFilter } from '~/models/notification'
import { notifications } from '../db/schema'
import { getDb } from '../db/client'

export interface CreateNotificationInput {
  type: string
  severity: NotificationSeverity
  title: string
  body?: string
  payload?: Record<string, unknown>
}

export interface ListNotificationsOptions {
  status?: NotificationStatusFilter
  limit?: number
}

export async function createNotification(input: CreateNotificationInput): Promise<Notification> {
  const id = randomUUID()
  const createdAt = new Date().toISOString()
  const db = getDb()
  db.insert(notifications).values({
    id,
    type: input.type,
    severity: input.severity,
    title: input.title,
    body: input.body ?? null,
    payloadJson: input.payload ? JSON.stringify(input.payload) : null,
    read: false,
    createdAt,
  }).run()
  return {
    id,
    type: input.type,
    severity: input.severity,
    title: input.title,
    body: input.body,
    payload: input.payload,
    read: false,
    createdAt,
  }
}

export async function listNotifications(options: ListNotificationsOptions = {}): Promise<Notification[]> {
  const status = options.status ?? 'all'
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 200)
  const db = getDb()
  const conditions = []
  if (status === 'unread')
    conditions.push(eq(notifications.read, false))

  const qb = db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(limit)
  const rows = conditions.length > 0 ? qb.where(and(...conditions)).all() : qb.all()
  return rows.map(mapRow)
}

export async function countUnreadNotifications(): Promise<number> {
  const db = getDb()
  const row = db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(eq(notifications.read, false))
    .get()
  return Number(row?.count ?? 0)
}

export async function markNotificationRead(id: string): Promise<Notification | null> {
  const db = getDb()
  const existing = db.select().from(notifications).where(eq(notifications.id, id)).get()
  if (!existing)
    return null
  db.update(notifications).set({ read: true }).where(eq(notifications.id, id)).run()
  const row = db.select().from(notifications).where(eq(notifications.id, id)).get()
  return row ? mapRow(row) : null
}

export async function markAllNotificationsRead(): Promise<number> {
  const db = getDb()
  const res = db.update(notifications).set({ read: true }).where(eq(notifications.read, false)).run()
  return Number(res.changes ?? 0)
}

function mapRow(row: typeof notifications.$inferSelect): Notification {
  let payload: Record<string, unknown> | undefined
  if (row.payloadJson) {
    try {
      payload = JSON.parse(row.payloadJson) as Record<string, unknown>
    }
    catch {
      payload = undefined
    }
  }
  return {
    id: row.id,
    type: row.type,
    severity: row.severity as NotificationSeverity,
    title: row.title,
    body: row.body ?? undefined,
    payload,
    read: row.read,
    createdAt: row.createdAt,
  }
}
