/** @vitest-environment happy-dom */
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import type { Agent } from '~/models/agent'
import type { MissionControlEvent } from '~/models/realtime'
import { useAgents } from '~/composables/useAgents'

vi.mock('~/composables/useMcConfig', () => ({
  useMcConfig: () => ({ apiBase: ref('') }),
}))

describe('useAgents', () => {
  const agentsPayload: Agent[] = [
    {
      id: 'a1',
      name: 'Alpha',
      status: 'idle',
      model: 'm',
      tokenUsage: 3,
      lastSeenAt: 't',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('refresh maps agents via agentToSummary', async () => {
    const listAgents = vi.fn(async () => agentsPayload)
    const getHealth = vi.fn(async () => ({ ok: true }))
    const agentService = { listAgents, getHealth }

    const wrapper = mount(
      defineComponent({
        setup() {
          const events = ref<MissionControlEvent[]>([])
          const { agents, refresh } = useAgents({ agentService, events })
          return { agents, refresh }
        },
        template: '<span />',
      }),
    )

    await wrapper.vm.refresh()
    await flushPromises()

    expect(listAgents).toHaveBeenCalledTimes(1)
    expect(wrapper.vm.agents).toEqual([
      {
        id: 'a1',
        name: 'Alpha',
        status: 'idle',
        model: 'm',
        currentAction: undefined,
        currentTaskId: undefined,
        tokenUsage: 3,
        lastSeenAt: 't',
      },
    ])

    wrapper.unmount()
  })

  it('agent.status.changed triggers another refresh', async () => {
    const listAgents = vi.fn(async () => agentsPayload)
    const getHealth = vi.fn(async () => ({ ok: true }))
    const agentService = { listAgents, getHealth }

    const wrapper = mount(
      defineComponent({
        setup() {
          const events = ref<MissionControlEvent[]>([])
          const { refresh } = useAgents({ agentService, events })
          return { refresh, events }
        },
        template: '<span />',
      }),
    )

    await wrapper.vm.refresh()
    await flushPromises()
    expect(listAgents).toHaveBeenCalledTimes(1)

    wrapper.vm.events.push({
      id: 'e1',
      type: 'agent.status.changed',
      payload: {},
      createdAt: new Date().toISOString(),
    })
    await flushPromises()

    expect(listAgents).toHaveBeenCalledTimes(2)
    wrapper.unmount()
  })
})
