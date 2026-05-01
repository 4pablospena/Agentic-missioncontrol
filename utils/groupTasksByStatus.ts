import type { AgentTask, TaskStatus } from '~/models/task'

const STATUSES: TaskStatus[] = [
  'scheduled',
  'queued',
  'running',
  'completed',
  'failed',
  'cancelled',
]

export function groupTasksByStatus(tasks: AgentTask[]): Record<TaskStatus, AgentTask[]> {
  const empty = (): AgentTask[] => []
  const buckets = Object.fromEntries(
    STATUSES.map(s => [s, empty()]),
  ) as Record<TaskStatus, AgentTask[]>

  for (const t of tasks) {
    const list = buckets[t.status]
    if (list)
      list.push(t)
  }

  return buckets
}
