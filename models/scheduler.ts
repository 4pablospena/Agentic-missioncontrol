import type { CreateTaskPayload } from '~/models/task'

export interface ScheduledTask {
  id: string
  taskTemplate: CreateTaskPayload
  cronExpression: string
  enabled: boolean
  nextRunAt?: string
  lastRunAt?: string
  createdAt: string
  updatedAt: string
}

export interface ScheduleTaskPayload {
  taskTemplate: CreateTaskPayload
  cronExpression: string
  enabled: boolean
}
