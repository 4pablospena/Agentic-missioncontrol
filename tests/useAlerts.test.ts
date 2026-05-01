/** @vitest-environment happy-dom */
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import type { Alert } from '~/models/alert'
import type { MissionControlEvent } from '~/models/realtime'
import { useAlerts } from '~/composables/useAlerts'

vi.mock('~/composables/useMcConfig', () => ({
  useMcConfig: () => ({ apiBase: ref('') }),
}))

describe('useAlerts', () => {
  const alertsPayload: Alert[] = [
    {
      id: 'al1',
      severity: 'warn',
      title: 't',
      message: 'm',
      acknowledged: false,
      createdAt: 'c',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('refresh loads alerts', async () => {
    const list = vi.fn(async () => alertsPayload)
    const acknowledge = vi.fn()
    const create = vi.fn()
    const alertService = { list, acknowledge, create }

    const wrapper = mount(
      defineComponent({
        setup() {
          const events = ref<MissionControlEvent[]>([])
          return useAlerts({ alertService, events })
        },
        template: '<span />',
      }),
    )

    await wrapper.vm.refresh()
    await flushPromises()

    expect(list).toHaveBeenCalledTimes(1)
    expect(wrapper.vm.alerts).toEqual(alertsPayload)

    wrapper.unmount()
  })

  it('acknowledge calls service then refresh', async () => {
    const list = vi.fn(async () => alertsPayload)
    const acknowledge = vi.fn(async () => alertsPayload[0]!)
    const create = vi.fn()
    const alertService = { list, acknowledge, create }

    const wrapper = mount(
      defineComponent({
        setup() {
          const events = ref<MissionControlEvent[]>([])
          return useAlerts({ alertService, events })
        },
        template: '<span />',
      }),
    )

    await wrapper.vm.refresh()
    await flushPromises()
    list.mockClear()

    await wrapper.vm.acknowledge('al1')
    await flushPromises()

    expect(acknowledge).toHaveBeenCalledWith('al1')
    expect(list).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })
})
