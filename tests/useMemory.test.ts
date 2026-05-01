/** @vitest-environment happy-dom */
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import type { MemoryItem } from '~/models/memory'
import type { MissionControlEvent } from '~/models/realtime'
import { useMemory } from '~/composables/useMemory'

vi.mock('~/composables/useMcConfig', () => ({
  useMcConfig: () => ({ apiBase: ref('') }),
}))

describe('useMemory', () => {
  const sample: MemoryItem = {
    id: 'm1',
    agentId: 'main',
    content: 'hello',
    source: 'manual',
    createdAt: 't',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loadItems uses memoryService', async () => {
    const list = vi.fn(async () => [sample])
    const memoryService = {
      list,
      search: vi.fn(),
      inject: vi.fn(),
      get: vi.fn(),
      remove: vi.fn(),
    }

    const wrapper = mount(
      defineComponent({
        setup() {
          const events = ref<MissionControlEvent[]>([])
          return useMemory({ memoryService, events })
        },
        template: '<span />',
      }),
    )

    await wrapper.vm.loadItems()
    await flushPromises()
    expect(list).toHaveBeenCalledTimes(1)
    expect(wrapper.vm.items).toEqual([sample])

    wrapper.unmount()
  })

  it('memory.created realtime event reloads list', async () => {
    let calls = 0
    const list = vi.fn(async () => {
      calls++
      return [sample]
    })
    const memoryService = {
      list,
      search: vi.fn(),
      inject: vi.fn(),
      get: vi.fn(),
      remove: vi.fn(),
    }

    const wrapper = mount(
      defineComponent({
        setup() {
          const events = ref<MissionControlEvent[]>([])
          const composable = useMemory({ memoryService, events })
          return { ...composable, events }
        },
        template: '<span />',
      }),
    )

    await wrapper.vm.loadItems()
    await flushPromises()
    expect(calls).toBe(1)

    wrapper.vm.events.push({
      id: 'e1',
      type: 'memory.created',
      payload: {},
      createdAt: new Date().toISOString(),
    })
    await flushPromises()
    expect(calls).toBeGreaterThanOrEqual(2)

    wrapper.unmount()
  })
})
