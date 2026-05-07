/** @vitest-environment happy-dom */
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import type { ScheduledTask } from '~/models/scheduler'
import { useScheduler } from '~/composables/useScheduler'

vi.mock('~/composables/useMcConfig', () => ({
  useMcConfig: () => ({ apiBase: ref('') }),
}))

describe('useScheduler', () => {
  const schedule: ScheduledTask = {
    id: 's1',
    taskTemplate: { title: 'Cron task', priority: 'normal' },
    cronExpression: '*/10 * * * *',
    enabled: true,
    nextRunAt: '2099-01-01T00:00:00.000Z',
    createdAt: 'c',
    updatedAt: 'u',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loadSchedules loads via schedulerService', async () => {
    const list = vi.fn(async () => [schedule])
    const schedulerService = {
      list,
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      enable: vi.fn(),
      disable: vi.fn(),
      runNow: vi.fn(),
    }

    const wrapper = mount(
      defineComponent({
        setup() {
          return useScheduler({ schedulerService })
        },
        template: '<span />',
      }),
    )

    await wrapper.vm.loadSchedules()
    await flushPromises()

    expect(list).toHaveBeenCalledTimes(1)
    expect(wrapper.vm.schedules).toEqual([schedule])

    wrapper.unmount()
  })
})
