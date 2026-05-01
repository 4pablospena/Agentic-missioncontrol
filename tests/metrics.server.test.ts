import { describe, expect, it } from 'vitest'
import type { Agent } from '../models/agent'
import type { Alert } from '../models/alert'
import {
  buildErrorSeverities,
  buildModelUsage,
  buildSessionStatuses,
  buildTokenMetrics,
} from '../server/services/metrics.server'

describe('metrics.server', () => {
  const agents: Agent[] = [
    {
      id: '1',
      name: 'A',
      status: 'running',
      model: 'm1',
      tokenUsage: 10,
    },
    {
      id: '2',
      name: 'B',
      status: 'idle',
      model: 'm1',
      tokenUsage: 5,
    },
  ]

  it('buildTokenMetrics aggregates', () => {
    const r = buildTokenMetrics(agents)
    expect(r.total).toBe(15)
    expect(r.byAgent).toHaveLength(2)
  })

  it('buildModelUsage groups by model', () => {
    const r = buildModelUsage(agents)
    expect(r.find(x => x.model === 'm1')?.tokens).toBe(15)
  })

  it('buildSessionStatuses counts statuses', () => {
    const r = buildSessionStatuses(agents)
    expect(r.find(x => x.status === 'running')?.count).toBe(1)
    expect(r.find(x => x.status === 'idle')?.count).toBe(1)
  })

  it('buildErrorSeverities skips acknowledged', () => {
    const alerts: Alert[] = [
      {
        id: '1',
        severity: 'critical',
        title: 't',
        message: 'm',
        acknowledged: false,
        createdAt: 'x',
      },
      {
        id: '2',
        severity: 'critical',
        title: 't2',
        message: 'm2',
        acknowledged: true,
        createdAt: 'y',
      },
    ]
    const r = buildErrorSeverities(alerts)
    expect(r.find(x => x.severity === 'critical')?.count).toBe(1)
  })
})
