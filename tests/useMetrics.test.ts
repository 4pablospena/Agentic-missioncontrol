/** @vitest-environment happy-dom */
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import type { MissionControlEvent } from '~/models/realtime'
import { useMetrics } from '~/composables/useMetrics'

vi.mock('~/composables/useMcConfig', () => ({
  useMcConfig: () => ({ apiBase: ref('') }),
}))

describe('useMetrics', () => {
  const tokens = { byAgent: [], total: 0 }
  const models = [{ model: 'gpt', tokens: 1 }]
  const sessions = [{ status: 'active', count: 2 }]
  const errors = [{ severity: 'warn' as const, count: 3 }]
  const costs = { totalUsd: 0, byAgent: [], byModel: [], trend: [], anomalies: [] }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('refresh fills state from Promise.all of service methods', async () => {
    const metricService = {
      getTokens: vi.fn(async () => tokens),
      getModels: vi.fn(async () => models),
      getSessions: vi.fn(async () => sessions),
      getErrors: vi.fn(async () => errors),
      getCosts: vi.fn(async () => costs),
    }

    const wrapper = mount(
      defineComponent({
        setup() {
          const events = ref<MissionControlEvent[]>([])
          return useMetrics({ metricService, events })
        },
        template: '<span />',
      }),
    )

    await wrapper.vm.refresh()
    await flushPromises()

    expect(metricService.getTokens).toHaveBeenCalledTimes(1)
    expect(wrapper.vm.tokens).toEqual(tokens)
    expect(wrapper.vm.models).toEqual(models)
    expect(wrapper.vm.sessions).toEqual(sessions)
    expect(wrapper.vm.errors).toEqual(errors)
    expect(wrapper.vm.costs).toEqual(costs)

    wrapper.unmount()
  })

  it('metric.updated triggers refresh', async () => {
    const metricService = {
      getTokens: vi.fn(async () => tokens),
      getModels: vi.fn(async () => models),
      getSessions: vi.fn(async () => sessions),
      getErrors: vi.fn(async () => errors),
      getCosts: vi.fn(async () => costs),
    }

    const wrapper = mount(
      defineComponent({
        setup() {
          const events = ref<MissionControlEvent[]>([])
          const metrics = useMetrics({ metricService, events })
          return { ...metrics, events }
        },
        template: '<span />',
      }),
    )

    await wrapper.vm.refresh()
    await flushPromises()
    metricService.getTokens.mockClear()

    wrapper.vm.events.push({
      id: 'm1',
      type: 'metric.updated',
      payload: {},
      createdAt: new Date().toISOString(),
    })
    await flushPromises()

    expect(metricService.getTokens).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })
})
