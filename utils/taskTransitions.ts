import type { TaskStatus } from '~/models/task'

/** Directed edges allowed by domain rules (Fase 3 doc). */
const ALLOWED: Record<TaskStatus, readonly TaskStatus[]> = {
  queued: ['running', 'cancelled'],
  running: ['completed', 'failed', 'cancelled'],
  failed: ['queued'],
  scheduled: ['queued', 'cancelled'],
  completed: [],
  cancelled: [],
}

export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  return ALLOWED[from]?.includes(to) ?? false
}

export function assertTransition(from: TaskStatus, to: TaskStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid task transition: ${from} -> ${to}`)
  }
}
