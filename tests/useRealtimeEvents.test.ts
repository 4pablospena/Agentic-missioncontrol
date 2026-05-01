/** @vitest-environment happy-dom */
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { useRealtimeEvents } from '../composables/useRealtimeEvents'
import type { MissionControlEvent } from '../models/realtime'
import type { RealtimeConnection } from '../services/realtime.service'

function createMockConnection(): RealtimeConnection & {
  emitStatus: (c: boolean) => void
  emitMessage: (ev: MissionControlEvent) => void
} {
  const statusListeners = new Set<(c: boolean) => void>()
  const messageListeners = new Set<(ev: MissionControlEvent) => void>()
  return {
    connect() {
      for (const fn of statusListeners)
        fn(true)
    },
    disconnect() {
      for (const fn of statusListeners)
        fn(false)
    },
    onStatus(fn) {
      statusListeners.add(fn)
      return () => statusListeners.delete(fn)
    },
    onMessage(fn) {
      messageListeners.add(fn)
      return () => messageListeners.delete(fn)
    },
    emitStatus(c) {
      for (const fn of statusListeners)
        fn(c)
    },
    emitMessage(ev) {
      for (const fn of messageListeners)
        fn(ev)
    },
  }
}

describe('useRealtimeEvents', () => {
  it('reflects connection status and accumulates events', async () => {
    const mock = createMockConnection()
    const wrapper = mount(
      defineComponent({
        setup() {
          const { events, connected } = useRealtimeEvents({ connection: mock })
          return { events, connected }
        },
        template: '<span />',
      }),
    )
    await flushPromises()
    expect(wrapper.vm.connected).toBe(true)

    const ev: MissionControlEvent = {
      id: '1',
      type: 'log.created',
      payload: {},
      createdAt: new Date().toISOString(),
    }
    mock.emitMessage(ev)
    await flushPromises()
    expect(wrapper.vm.events).toHaveLength(1)
    expect(wrapper.vm.events[0]).toEqual(ev)

    wrapper.unmount()
    await flushPromises()
  })

  it('caps events at 100', async () => {
    const mock = createMockConnection()
    const wrapper = mount(
      defineComponent({
        setup() {
          const { events } = useRealtimeEvents({ connection: mock })
          return { events }
        },
        template: '<span />',
      }),
    )
    await flushPromises()
    const createdAt = new Date().toISOString()
    for (let i = 0; i < 105; i++) {
      mock.emitMessage({
        id: String(i),
        type: 'log.created',
        payload: {},
        createdAt,
      })
    }
    await flushPromises()
    expect(wrapper.vm.events).toHaveLength(100)
    expect(wrapper.vm.events[0]?.id).toBe('5')
    expect(wrapper.vm.events[99]?.id).toBe('104')

    wrapper.unmount()
  })
})
