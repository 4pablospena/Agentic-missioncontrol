import { describe, expect, it } from 'vitest'
import type { AgentTask } from '~/models/task'
import { groupTasksByStatus } from '~/utils/groupTasksByStatus'

function task(partial: Partial<AgentTask> & Pick<AgentTask, 'id' | 'status'>): AgentTask {
  return {
    title: 't',
    priority: 'normal',
    progress: 0,
    createdAt: 'c',
    updatedAt: 'u',
    ...partial,
  }
}

describe('groupTasksByStatus', () => {
  it('places tasks into correct buckets', () => {
    const tasks: AgentTask[] = [
      task({ id: '1', status: 'queued' }),
      task({ id: '2', status: 'queued' }),
      task({ id: '3', status: 'running' }),
    ]
    const g = groupTasksByStatus(tasks)
    expect(g.queued.map(x => x.id)).toEqual(['1', '2'])
    expect(g.running.map(x => x.id)).toEqual(['3'])
    expect(g.completed).toHaveLength(0)
  })

  it('returns all status keys', () => {
    const g = groupTasksByStatus([])
    expect(Object.keys(g).sort()).toEqual([
      'cancelled',
      'completed',
      'failed',
      'queued',
      'running',
      'scheduled',
    ])
  })
})
