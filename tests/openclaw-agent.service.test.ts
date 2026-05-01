import { describe, expect, it, vi } from 'vitest'
import type { Agent } from '../models/agent'
import { createOpenClawAgentService } from '../services/openclaw-agent.service'

describe('createOpenClawAgentService', () => {
  it('getAgent returns null on 404', async () => {
    const fetchMock = vi.fn().mockRejectedValue({ statusCode: 404 })
    const client = {
      get: fetchMock,
      post: vi.fn(),
      patch: vi.fn(),
    }
    const svc = createOpenClawAgentService(client as Parameters<typeof createOpenClawAgentService>[0])
    await expect(svc.getAgent('missing')).resolves.toBeNull()
  })

  it('getAgent returns agent on success', async () => {
    const agent: Agent = {
      id: '1',
      name: 'n',
      status: 'idle',
    }
    const fetchMock = vi.fn().mockResolvedValue(agent)
    const client = {
      get: fetchMock,
      post: vi.fn(),
      patch: vi.fn(),
    }
    const svc = createOpenClawAgentService(client as Parameters<typeof createOpenClawAgentService>[0])
    await expect(svc.getAgent('1')).resolves.toEqual(agent)
  })
})
