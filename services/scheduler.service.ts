import type { ScheduledTask, ScheduleTaskPayload } from '~/models/scheduler'
import type { ApiClient } from '~/services/api-client.service'
import { unwrapApiEnvelope } from './api-envelope.service'

export interface SchedulerService {
  list(): Promise<ScheduledTask[]>
  get(id: string): Promise<ScheduledTask>
  create(payload: ScheduleTaskPayload): Promise<ScheduledTask>
  update(id: string, patch: Partial<ScheduleTaskPayload>): Promise<ScheduledTask>
  delete(id: string): Promise<void>
  enable(id: string): Promise<ScheduledTask>
  disable(id: string): Promise<ScheduledTask>
  runNow(id: string): Promise<ScheduledTask>
}

export function createSchedulerService(client: ApiClient): SchedulerService {
  return {
    list() {
      return client
        .get<ScheduledTask[]>('/api/schedules')
        .then(unwrapApiEnvelope)
    },
    async get(id: string) {
      return client
        .get<ScheduledTask>(`/api/schedules/${encodeURIComponent(id)}`)
        .then(unwrapApiEnvelope)
    },
    create(payload: ScheduleTaskPayload) {
      return client
        .post<ScheduleTaskPayload, ScheduledTask>('/api/schedules', payload)
        .then(unwrapApiEnvelope)
    },
    update(id: string, patch: Partial<ScheduleTaskPayload>) {
      return client.patch<Partial<ScheduleTaskPayload>, ScheduledTask>(
        `/api/schedules/${encodeURIComponent(id)}`,
        patch,
      ).then(unwrapApiEnvelope)
    },
    async delete(id: string) {
      await client.delete<{ ok: boolean }>(`/api/schedules/${encodeURIComponent(id)}`)
    },
    enable(id: string) {
      return client.post<Record<string, never>, ScheduledTask>(
        `/api/schedules/${encodeURIComponent(id)}/enable`,
        {},
      ).then(unwrapApiEnvelope)
    },
    disable(id: string) {
      return client.post<Record<string, never>, ScheduledTask>(
        `/api/schedules/${encodeURIComponent(id)}/disable`,
        {},
      ).then(unwrapApiEnvelope)
    },
    runNow(id: string) {
      return client.post<Record<string, never>, ScheduledTask>(
        `/api/schedules/${encodeURIComponent(id)}/run`,
        {},
      ).then(unwrapApiEnvelope)
    },
  }
}
