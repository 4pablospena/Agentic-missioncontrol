export type TaskStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'scheduled'

export type TaskPriority = 'low' | 'normal' | 'high' | 'critical'

export interface AgentTask {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assignedAgentId?: string
  progress: number
  input?: Record<string, unknown>
  result?: unknown
  error?: string
  scheduledAt?: string
  startedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTaskPayload {
  title: string
  description?: string
  priority: TaskPriority
  assignedAgentId?: string
  input?: Record<string, unknown>
}

export interface UpdateTaskPayload {
  title?: string
  description?: string
  priority?: TaskPriority
  assignedAgentId?: string
}

export interface TaskFilters {
  status?: TaskStatus
  assignedAgentId?: string
  priority?: TaskPriority
}

/** Metadata attached to audit logs for task lifecycle (JSON in logs.metadata). */
export interface TaskLogMetadata {
  taskId: string
  previousStatus?: TaskStatus
  nextStatus?: TaskStatus
  assignedAgentId?: string
}

export type TaskRealtimeEventType =
  | 'task.created'
  | 'task.updated'
  | 'task.status.changed'
  | 'task.progress.changed'
  | 'task.completed'
  | 'task.failed'

export interface TaskEventRecord {
  id: string
  taskId: string
  type: TaskRealtimeEventType
  payload: Record<string, unknown>
  createdAt: string
}
