import { randomUUID } from 'node:crypto'
import { and, desc, eq } from 'drizzle-orm'
import type { MissionControlEvent } from '~/models/realtime'
import type {
  AgentTask,
  CreateTaskPayload,
  TaskEventRecord,
  TaskFilters,
  TaskPriority,
  TaskRealtimeEventType,
  TaskStatus,
  UpdateTaskPayload,
} from '~/models/task'
import { assertTransition } from '~/utils/taskTransitions'
import { getDb } from '../db/client'
import { taskEvents, tasks } from '../db/schema'
import { broadcastMissionControlEvent } from '../utils/realtime-broadcast'
import { createLogEntry } from './logger.server'

function nowIso(): string {
  return new Date().toISOString()
}

function parseJsonRecord(raw: string | null): Record<string, unknown> | undefined {
  if (!raw)
    return undefined
  try {
    const v = JSON.parse(raw) as unknown
    return typeof v === 'object' && v !== null && !Array.isArray(v)
      ? v as Record<string, unknown>
      : undefined
  }
  catch {
    return undefined
  }
}

function parseJsonUnknown(raw: string | null): unknown {
  if (!raw)
    return undefined
  try {
    return JSON.parse(raw) as unknown
  }
  catch {
    return undefined
  }
}

export function mapRowToAgentTask(row: typeof tasks.$inferSelect): AgentTask {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    status: row.status as TaskStatus,
    priority: row.priority as TaskPriority,
    assignedAgentId: row.agentId ?? undefined,
    progress: row.progress ?? 0,
    input: parseJsonRecord(row.inputJson),
    result: parseJsonUnknown(row.resultJson),
    error: row.error ?? undefined,
    scheduledAt: row.scheduledAt ?? undefined,
    startedAt: row.startedAt ?? undefined,
    completedAt: row.completedAt ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function broadcastEvt(partial: Omit<MissionControlEvent, 'id' | 'createdAt'> & { id?: string }) {
  const full: MissionControlEvent = {
    id: partial.id ?? randomUUID(),
    type: partial.type,
    payload: partial.payload,
    createdAt: partial.createdAt ?? nowIso(),
  }
  broadcastMissionControlEvent(full)
}

async function auditTask(
  taskId: string,
  message: string,
  meta: { previousStatus?: TaskStatus, nextStatus?: TaskStatus, assignedAgentId?: string },
): Promise<void> {
  await createLogEntry({
    level: 'info',
    message,
    metadata: {
      taskId,
      previousStatus: meta.previousStatus,
      nextStatus: meta.nextStatus,
      assignedAgentId: meta.assignedAgentId,
    },
  })
}

function recordTaskEvent(taskId: string, type: TaskRealtimeEventType, payload: Record<string, unknown>): void {
  const db = getDb()
  db.insert(taskEvents).values({
    id: randomUUID(),
    taskId,
    type,
    payloadJson: JSON.stringify(payload),
    createdAt: nowIso(),
  }).run()
}

export async function listTasks(filters: TaskFilters = {}): Promise<AgentTask[]> {
  const db = getDb()
  const conditions = []
  if (filters.status)
    conditions.push(eq(tasks.status, filters.status))
  if (filters.assignedAgentId?.trim())
    conditions.push(eq(tasks.agentId, filters.assignedAgentId.trim()))
  if (filters.priority)
    conditions.push(eq(tasks.priority, filters.priority))

  const qb = db.select().from(tasks).orderBy(desc(tasks.updatedAt))
  const rows = conditions.length > 0 ? qb.where(and(...conditions)).all() : qb.all()
  return rows.map(mapRowToAgentTask)
}

export async function getTask(id: string): Promise<AgentTask | null> {
  const db = getDb()
  const row = db.select().from(tasks).where(eq(tasks.id, id)).get()
  return row ? mapRowToAgentTask(row) : null
}

export async function createTask(payload: CreateTaskPayload): Promise<AgentTask> {
  const db = getDb()
  const id = randomUUID()
  const ts = nowIso()
  db.insert(tasks).values({
    id,
    title: payload.title.trim(),
    description: payload.description?.trim() ?? null,
    status: 'queued',
    priority: payload.priority,
    agentId: payload.assignedAgentId?.trim() ?? null,
    progress: 0,
    inputJson: payload.input ? JSON.stringify(payload.input) : null,
    resultJson: null,
    error: null,
    scheduledAt: null,
    startedAt: null,
    completedAt: null,
    createdAt: ts,
    updatedAt: ts,
  }).run()

  recordTaskEvent(id, 'task.created', { title: payload.title.trim() })
  await auditTask(id, `Task created: ${payload.title.trim()}`, {
    nextStatus: 'queued',
    assignedAgentId: payload.assignedAgentId?.trim(),
  })
  broadcastEvt({
    type: 'task.created',
    payload: { taskId: id, status: 'queued' },
  })

  const created = await getTask(id)
  if (!created)
    throw new Error('Failed to load created task')
  return created
}

export async function updateTask(id: string, patch: UpdateTaskPayload): Promise<AgentTask | null> {
  const existing = await getTask(id)
  if (!existing)
    return null

  const db = getDb()
  const ts = nowIso()
  const updates: Record<string, unknown> = { updatedAt: ts }
  if (patch.title !== undefined)
    updates.title = patch.title.trim()
  if (patch.description !== undefined)
    updates.description = patch.description.trim() || null
  if (patch.priority !== undefined)
    updates.priority = patch.priority
  if (patch.assignedAgentId !== undefined)
    updates.agentId = patch.assignedAgentId.trim() || null

  db.update(tasks).set(updates as Partial<typeof tasks.$inferInsert>).where(eq(tasks.id, id)).run()

  recordTaskEvent(id, 'task.updated', { keys: Object.keys(patch) })
  await auditTask(id, 'Task updated', {
    assignedAgentId:
      patch.assignedAgentId !== undefined
        ? (patch.assignedAgentId.trim() || undefined)
        : existing.assignedAgentId,
  })
  broadcastEvt({
    type: 'task.updated',
    payload: { taskId: id },
  })
  return getTask(id)
}

export async function transitionTask(
  id: string,
  to: TaskStatus,
  opts?: { progress?: number, result?: unknown, error?: string },
): Promise<AgentTask | null> {
  const existing = await getTask(id)
  if (!existing)
    return null
  assertTransition(existing.status, to)
  const db = getDb()
  const ts = nowIso()
  const prev = existing.status

  const updates: Record<string, unknown> = {
    status: to,
    updatedAt: ts,
  }

  if (opts?.progress !== undefined)
    updates.progress = Math.min(100, Math.max(0, opts.progress))

  if (to === 'running' && !existing.startedAt)
    updates.startedAt = ts

  if (to === 'completed') {
    updates.completedAt = ts
    updates.error = null
    if (opts?.result !== undefined)
      updates.resultJson = JSON.stringify(opts.result)
  }

  if (to === 'failed') {
    updates.completedAt = ts
    updates.error = opts?.error ?? 'Unknown error'
  }

  if (to === 'queued' && prev === 'failed') {
    updates.error = null
    updates.resultJson = null
    updates.progress = 0
    updates.startedAt = null
    updates.completedAt = null
  }

  db.update(tasks).set(updates as Partial<typeof tasks.$inferInsert>).where(eq(tasks.id, id)).run()

  recordTaskEvent(id, 'task.status.changed', { from: prev, to })
  await auditTask(id, `Task ${prev} -> ${to}`, {
    previousStatus: prev,
    nextStatus: to,
    assignedAgentId: existing.assignedAgentId,
  })
  broadcastEvt({
    type: 'task.status.changed',
    payload: {
      taskId: id,
      previousStatus: prev,
      nextStatus: to,
    },
  })

  return getTask(id)
}

export async function startTask(id: string): Promise<AgentTask | null> {
  return transitionTask(id, 'running')
}

export async function cancelTask(id: string): Promise<AgentTask | null> {
  const existing = await getTask(id)
  if (!existing)
    return null
  const st = existing.status
  if (st !== 'queued' && st !== 'running' && st !== 'scheduled') {
    throw new Error('Task cannot be cancelled in current status')
  }
  return transitionTask(id, 'cancelled')
}

export async function retryTask(id: string): Promise<AgentTask | null> {
  return transitionTask(id, 'queued')
}

export async function setTaskProgress(id: string, progress: number): Promise<AgentTask | null> {
  const existing = await getTask(id)
  if (!existing || existing.status !== 'running')
    return null
  const db = getDb()
  const p = Math.min(100, Math.max(0, progress))
  db.update(tasks).set({ progress: p, updatedAt: nowIso() }).where(eq(tasks.id, id)).run()
  recordTaskEvent(id, 'task.progress.changed', { progress: p })
  broadcastEvt({
    type: 'task.progress.changed',
    payload: { taskId: id, progress: p },
  })
  return getTask(id)
}

export async function completeTask(id: string, result?: unknown): Promise<AgentTask | null> {
  const out = await transitionTask(id, 'completed', { result })
  if (out) {
    broadcastEvt({
      type: 'task.completed',
      payload: { taskId: id },
    })
  }
  return out
}

export async function failTask(id: string, error: string): Promise<AgentTask | null> {
  const out = await transitionTask(id, 'failed', { error })
  if (out) {
    broadcastEvt({
      type: 'task.failed',
      payload: { taskId: id, error },
    })
  }
  return out
}

export async function promoteScheduledToQueued(id: string): Promise<AgentTask | null> {
  const existing = await getTask(id)
  if (!existing || existing.status !== 'scheduled')
    return null
  return transitionTask(id, 'queued')
}

export async function createScheduledTaskRow(template: CreateTaskPayload, scheduledAt: string): Promise<AgentTask> {
  const db = getDb()
  const id = randomUUID()
  const ts = nowIso()
  db.insert(tasks).values({
    id,
    title: template.title.trim(),
    description: template.description?.trim() ?? null,
    status: 'scheduled',
    priority: template.priority,
    agentId: template.assignedAgentId?.trim() ?? null,
    progress: 0,
    inputJson: template.input ? JSON.stringify(template.input) : null,
    resultJson: null,
    error: null,
    scheduledAt,
    startedAt: null,
    completedAt: null,
    createdAt: ts,
    updatedAt: ts,
  }).run()

  recordTaskEvent(id, 'task.created', { scheduledAt })
  await auditTask(id, `Scheduled task created: ${template.title.trim()}`, {
    nextStatus: 'scheduled',
    assignedAgentId: template.assignedAgentId?.trim(),
  })
  broadcastEvt({
    type: 'task.created',
    payload: { taskId: id, status: 'scheduled' },
  })

  const t = await getTask(id)
  if (!t)
    throw new Error('Failed to load scheduled task')
  return t
}

export async function listTaskEvents(taskId: string): Promise<TaskEventRecord[]> {
  const db = getDb()
  const rows = db.select().from(taskEvents).where(eq(taskEvents.taskId, taskId)).orderBy(desc(taskEvents.createdAt)).all()
  return rows.map(r => ({
    id: r.id,
    taskId: r.taskId,
    type: r.type as TaskRealtimeEventType,
    payload: parseJsonRecord(r.payloadJson) ?? {},
    createdAt: r.createdAt,
  }))
}
