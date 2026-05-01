import { describe, expect, it } from 'vitest'
import type { TimelineEvent } from '../models/timeline'
import { sortEventsByDateAsc } from '../utils/sortEventsByDate'

describe('sortEventsByDateAsc', () => {
  it('orders by createdAt ascending', () => {
    const events: TimelineEvent[] = [
      { id: 'b', type: 'x', message: '', createdAt: '2026-02-01T00:00:00Z' },
      { id: 'a', type: 'x', message: '', createdAt: '2026-01-01T00:00:00Z' },
    ]
    const sorted = sortEventsByDateAsc(events)
    expect(sorted.map(e => e.id)).toEqual(['a', 'b'])
  })
})
