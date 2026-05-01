import { randomUUID } from 'node:crypto'
import { desc, eq } from 'drizzle-orm'
import type { CreateTaskPayload } from '~/models/task'
import type { ScheduledTask, ScheduleTaskPayload } from '~/models/scheduler'
import { getDb } from '../db/client'
import { taskSchedules } from '../db/schema'
import { createLogEntry } from './logger.server'
import { createTask } from './tasks.server'
import { nextCronRunIso } from '~/utils/isValidCronExpression'

function nowIso(): string {
  return new Date().toISOString()
}

function parseTemplate(raw: string): CreateTaskPayload {
  const v = JSON.parse(raw) as unknown
  if (typeof v !== 'object' || v === null || Array.isArray(v))
    throw new Error('Invalid task template JSON')
  const o = v as Record<string, unknown>
  const title = typeof o.title === 'string' ? o.title : ''
  if (!title.trim())
    throw new Error('Template requires title')
  const priorityRaw = o.priority
  const priority
    = priorityRaw === 'low'
    || priorityRaw === 'normal'
    || priorityRaw === 'high'
    || priorityRaw === 'critical'
      ? priorityRaw
      : 'normal'
  const description = typeof o.description === 'string' ? o.description : undefined
  const assignedAgentId = typeof o.assignedAgentId === 'string' ? o.assignedAgentId : undefined
  const input
    = typeof o.input === 'object' && o.input !== null && !Array.isArray(o.input)
      ? (o.input as Record<string, unknown>)
      : undefined
  return {
    title,
    description,
    priority,
    assignedAgentId,
    input,
  }
}

export function mapScheduleRow(row: typeof taskSchedules.$inferSelect): ScheduledTask {
  let taskTemplate: CreateTaskPayload
  try {
    taskTemplate = parseTemplate(row.taskTemplateJson)
  }
  catch {
    taskTemplate = { title: '(invalid template)', priority: 'normal' }
  }
  return {
    id: row.id,
    taskTemplate,
    cronExpression: row.cronExpression,
    enabled: row.enabled,
    nextRunAt: row.nextRunAt ?? undefined,
    lastRunAt: row.lastRunAt ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function listSchedules(): Promise<ScheduledTask[]> {
  const db = getDb()
  const rows = db.select().from(taskSchedules).orderBy(desc(taskSchedules.updatedAt)).all()
  return rows.map(mapScheduleRow)
}

export async function getSchedule(id: string): Promise<ScheduledTask | null> {
  const db = getDb()
  const row = db.select().from(taskSchedules).where(eq(taskSchedules.id, id)).get()
  return row ? mapScheduleRow(row) : null
}

export async function createSchedule(payload: ScheduleTaskPayload): Promise<ScheduledTask> {
  const expr = payload.cronExpression.trim()
  const next = nextCronRunIso(expr)
  if (!next)
    throw new Error('Invalid cron expression')

  const db = getDb()
  const id = randomUUID()
  const ts = nowIso()
  db.insert(taskSchedules).values({
    id,
    taskTemplateJson: JSON.stringify(payload.taskTemplate),
    cronExpression: expr,
    enabled: payload.enabled,
    nextRunAt: next,
    lastRunAt: null,
    createdAt: ts,
    updatedAt: ts,
  }).run()

  await createLogEntry({
    level: 'info',
    message: `Schedule created: ${payload.taskTemplate.title}`,
    metadata: { scheduleId: id, cronExpression: expr },
  })

  const created = await getSchedule(id)
  if (!created)
    throw new Error('Failed to persist schedule')
  return created
}

export async function updateSchedule(
  id: string,
  patch: Partial<Pick<ScheduleTaskPayload, 'taskTemplate' | 'cronExpression' | 'enabled'>>,
): Promise<ScheduledTask | null> {
  const existing = await getSchedule(id)
  if (!existing)
    return null

  const db = getDb()
  const ts = nowIso()
  const expr = patch.cronExpression?.trim() ?? existing.cronExpression
  const next = nextCronRunIso(expr)
  if (!next)
    throw new Error('Invalid cron expression')

  const template = patch.taskTemplate ?? existing.taskTemplate

  db.update(taskSchedules).set({
    taskTemplateJson: JSON.stringify(template),
    cronExpression: expr,
    enabled: patch.enabled ?? existing.enabled,
    nextRunAt: next,
    updatedAt: ts,
  }).where(eq(taskSchedules.id, id)).run()

  return getSchedule(id)
}

export async function deleteSchedule(id: string): Promise<boolean> {
  const db = getDb()
  const existing = db.select().from(taskSchedules).where(eq(taskSchedules.id, id)).get()
  if (!existing)
    return false
  db.delete(taskSchedules).where(eq(taskSchedules.id, id)).run()
  return true
}

export async function setScheduleEnabled(id: string, enabled: boolean): Promise<ScheduledTask | null> {
  const existing = await getSchedule(id)
  if (!existing)
    return null
  const db = getDb()
  const ts = nowIso()
  const next = enabled ? nextCronRunIso(existing.cronExpression) ?? existing.nextRunAt : existing.nextRunAt
  db.update(taskSchedules).set({
    enabled,
    nextRunAt: next ?? null,
    updatedAt: ts,
  }).where(eq(taskSchedules.id, id)).run()
  return getSchedule(id)
}

export async function tickSchedules(): Promise<void> {
  const db = getDb()
  const rows = db.select().from(taskSchedules).where(eq(taskSchedules.enabled, true)).all()
  const now = nowIso()

  for (const row of rows) {
    const nextAt = row.nextRunAt
    if (!nextAt || nextAt > now)
      continue

    let template: CreateTaskPayload
    try {
      template = parseTemplate(row.taskTemplateJson)
    }
    catch {
      continue
    }

    await createTask(template)
    await createLogEntry({
      level: 'info',
      message: `Scheduled task fired: ${template.title}`,
      metadata: { scheduleId: row.id, cronExpression: row.cronExpression },
    })

    const last = nowIso()
    const anchorMs = Date.parse(last)
    const following = nextCronRunIso(
      row.cronExpression,
      new Date(Number.isFinite(anchorMs) ? anchorMs + 1 : Date.now()),
    ) ?? last

    db.update(taskSchedules).set({
      lastRunAt: last,
      nextRunAt: following,
      updatedAt: last,
    }).where(eq(taskSchedules.id, row.id)).run()
  }
}
