import type { TimelineEvent } from '~/models/timeline'

export function sortEventsByDateAsc(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}
