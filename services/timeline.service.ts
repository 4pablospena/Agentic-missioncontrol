import type { TimelineEvent } from '~/models/timeline'
import type { ApiClient } from '~/services/api-client.service'

export interface TimelineService {
  listSession(sessionId: string): Promise<TimelineEvent[]>
}

export function createTimelineService(client: ApiClient): TimelineService {
  return {
    listSession(sessionId: string) {
      return client.get<TimelineEvent[]>(
        `/api/events/session/${encodeURIComponent(sessionId)}`,
      )
    },
  }
}
