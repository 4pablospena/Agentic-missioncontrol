/** @vitest-environment happy-dom */
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import type { Notification } from '~/models/notification'
import type { MissionControlEvent } from '~/models/realtime'
import { useNotifications } from '~/composables/useNotifications'

vi.mock('~/composables/useMcConfig', () => ({
  useMcConfig: () => ({ apiBase: ref('') }),
}))

describe('useNotifications', () => {
  const sample: Notification[] = [
    {
      id: 'n1',
      type: 'alert.created',
      severity: 'error',
      title: 'Disk full',
      read: false,
      createdAt: '2026-05-03T08:00:00.000Z',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('refresh loads notifications and exposes unreadCount', async () => {
    const list = vi.fn(async () => sample)
    const markRead = vi.fn()
    const markAllRead = vi.fn()
    const notificationService = { list, markRead, markAllRead }

    const wrapper = mount(
      defineComponent({
        setup() {
          const events = ref<MissionControlEvent[]>([])
          return useNotifications({ notificationService, events })
        },
        template: '<span />',
      }),
    )

    await wrapper.vm.refresh()
    await flushPromises()

    expect(list).toHaveBeenCalledTimes(1)
    expect(wrapper.vm.items).toEqual(sample)
    expect(wrapper.vm.unreadCount).toBe(1)

    wrapper.unmount()
  })

  it('refreshes when an allowlisted realtime event arrives', async () => {
    const list = vi.fn(async () => sample)
    const markRead = vi.fn()
    const markAllRead = vi.fn()
    const notificationService = { list, markRead, markAllRead }

    const events = ref<MissionControlEvent[]>([])
    const wrapper = mount(
      defineComponent({
        setup() {
          return useNotifications({ notificationService, events })
        },
        template: '<span />',
      }),
    )

    await wrapper.vm.refresh()
    await flushPromises()
    list.mockClear()

    events.value = [...events.value, {
      id: 'evt-1',
      type: 'task.failed',
      payload: {},
      createdAt: '2026-05-03T08:01:00.000Z',
    }]
    await flushPromises()

    expect(list).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('ignores realtime events that are not in the persisted allowlist', async () => {
    const list = vi.fn(async () => sample)
    const markRead = vi.fn()
    const markAllRead = vi.fn()
    const notificationService = { list, markRead, markAllRead }

    const events = ref<MissionControlEvent[]>([])
    const wrapper = mount(
      defineComponent({
        setup() {
          return useNotifications({ notificationService, events })
        },
        template: '<span />',
      }),
    )

    await wrapper.vm.refresh()
    await flushPromises()
    list.mockClear()

    events.value = [...events.value, {
      id: 'evt-2',
      type: 'log.created',
      payload: {},
      createdAt: '2026-05-03T08:02:00.000Z',
    }]
    await flushPromises()

    expect(list).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('markRead drops the row when filter is unread', async () => {
    const list = vi.fn(async () => sample)
    const updated: Notification = { ...sample[0]!, read: true }
    const markRead = vi.fn(async () => updated)
    const markAllRead = vi.fn()
    const notificationService = { list, markRead, markAllRead }

    const wrapper = mount(
      defineComponent({
        setup() {
          const events = ref<MissionControlEvent[]>([])
          return useNotifications({ notificationService, events, initialStatus: 'unread' })
        },
        template: '<span />',
      }),
    )

    await wrapper.vm.refresh()
    await flushPromises()

    await wrapper.vm.markRead('n1')
    await flushPromises()

    expect(markRead).toHaveBeenCalledWith('n1')
    expect(wrapper.vm.items).toHaveLength(0)
    expect(wrapper.vm.unreadCount).toBe(0)

    wrapper.unmount()
  })
})
