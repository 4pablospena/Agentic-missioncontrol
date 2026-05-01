/** @vitest-environment happy-dom */
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import type { LogEntry } from '~/models/log'
import type { MissionControlEvent } from '~/models/realtime'
import { useLogs } from '~/composables/useLogs'

vi.mock('~/composables/useMcConfig', () => ({
  useMcConfig: () => ({ apiBase: ref('') }),
}))

describe('useLogs', () => {
  const logRows: LogEntry[] = [
    {
      id: 'l1',
      level: 'info',
      message: 'hello',
      createdAt: 't',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('refresh loads via logService.list', async () => {
    const list = vi.fn(async () => logRows)
    const create = vi.fn()
    const logService = { list, create }

    const wrapper = mount(
      defineComponent({
        setup() {
          const events = ref<MissionControlEvent[]>([])
          const composable = useLogs({ logService, events })
          return composable
        },
        template: '<span />',
      }),
    )

    await wrapper.vm.refresh()
    await flushPromises()

    expect(list).toHaveBeenCalledTimes(1)
    expect(wrapper.vm.logs).toEqual(logRows)

    wrapper.unmount()
  })

  it('setFilters merges and refreshes', async () => {
    const list = vi.fn(async () => logRows)
    const logService = { list, create: vi.fn() }

    const wrapper = mount(
      defineComponent({
        setup() {
          const events = ref<MissionControlEvent[]>([])
          return useLogs({
            logService,
            events,
            initialFilters: { query: 'q0' },
          })
        },
        template: '<span />',
      }),
    )

    await flushPromises()
    list.mockClear()

    wrapper.vm.setFilters({ agentId: 'ag1' })
    await flushPromises()

    expect(list).toHaveBeenCalledTimes(1)
    expect(list.mock.calls[0]?.[0]).toMatchObject({
      query: 'q0',
      agentId: 'ag1',
    })

    wrapper.unmount()
  })

  it('log.created on events triggers refresh', async () => {
    const list = vi.fn(async () => logRows)
    const logService = { list, create: vi.fn() }

    const wrapper = mount(
      defineComponent({
        setup() {
          const events = ref<MissionControlEvent[]>([])
          const logsComposable = useLogs({ logService, events })
          return { ...logsComposable, events }
        },
        template: '<span />',
      }),
    )

    await wrapper.vm.refresh()
    await flushPromises()
    list.mockClear()

    wrapper.vm.events.push({
      id: 'ev',
      type: 'log.created',
      payload: {},
      createdAt: new Date().toISOString(),
    })
    await flushPromises()

    expect(list).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })
})
