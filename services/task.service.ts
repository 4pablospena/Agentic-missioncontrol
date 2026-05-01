import type {
  AgentTask,
  CreateTaskPayload,
  TaskEventRecord,
  TaskFilters,
  UpdateTaskPayload,
} from '~/models/task'
import type { ApiClient } from '~/services/api-client.service'

export interface TaskService {
  list(filters?: TaskFilters): Promise<AgentTask[]>
  get(taskId: string): Promise<AgentTask>
  create(payload: CreateTaskPayload): Promise<AgentTask>
  update(taskId: string, payload: UpdateTaskPayload): Promise<AgentTask>
  start(taskId: string): Promise<AgentTask>
  cancel(taskId: string): Promise<AgentTask>
  retry(taskId: string): Promise<AgentTask>
  events(taskId: string): Promise<TaskEventRecord[]>
}

function appendParams(params: URLSearchParams, filters: TaskFilters) {
  if (filters.status)
    params.set('status', filters.status)
  if (filters.assignedAgentId)
    params.set('assignedAgentId', filters.assignedAgentId)
  if (filters.priority)
    params.set('priority', filters.priority)
}

export function createTaskService(client: ApiClient): TaskService {
  return {
    list(filters = {}) {
      const params = new URLSearchParams()
      appendParams(params, filters)
      const qs = params.toString()
      return client.get<AgentTask[]>(`/api/tasks${qs ? `?${qs}` : ''}`)
    },
    async get(taskId: string) {
      return client.get<AgentTask>(`/api/tasks/${encodeURIComponent(taskId)}`)
    },
    create(payload: CreateTaskPayload) {
      return client.post<CreateTaskPayload, AgentTask>('/api/tasks', payload)
    },
    update(taskId: string, payload: UpdateTaskPayload) {
      return client.patch<UpdateTaskPayload, AgentTask>(
        `/api/tasks/${encodeURIComponent(taskId)}`,
        payload,
      )
    },
    start(taskId: string) {
      return client.post<Record<string, never>, AgentTask>(
        `/api/tasks/${encodeURIComponent(taskId)}/start`,
        {},
      )
    },
    cancel(taskId: string) {
      return client.post<Record<string, never>, AgentTask>(
        `/api/tasks/${encodeURIComponent(taskId)}/cancel`,
        {},
      )
    },
    retry(taskId: string) {
      return client.post<Record<string, never>, AgentTask>(
        `/api/tasks/${encodeURIComponent(taskId)}/retry`,
        {},
      )
    },
    events(taskId: string) {
      return client.get<TaskEventRecord[]>(
        `/api/tasks/${encodeURIComponent(taskId)}/events`,
      )
    },
  }
}
