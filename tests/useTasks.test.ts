/** @vitest-environment happy-dom */
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import type { AgentTask } from '~/models/task'
import type { MissionControlEvent } from '~/models/realtime'
import { useTasks } from '~/composables/useTasks'

vi.mock('~/composables/useMcConfig', () => ({
  useMcConfig: () => ({ apiBase: ref('') }),
}))

describe('useTasks', () => {
  const sampleTask: AgentTask = {
    id: 't1',
    title: 'Hello',
    status: 'queued',
    priority: 'normal',
    progress: 0,
    createdAt: 'c',
    updatedAt: 'u',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loadTasks populates list via taskService', async () => {
    const list = vi.fn(async () => [sampleTask])
    const taskService = {
      list,
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      start: vi.fn(),
      cancel: vi.fn(),
      retry: vi.fn(),
      events: vi.fn(),
    }

    const wrapper = mount(
      defineComponent({
        setup() {
          const events = ref<MissionControlEvent[]>([])
          return useTasks({ taskService, events })
        },
        template: '<span />',
      }),
    )

    await wrapper.vm.loadTasks()
    await flushPromises()

    expect(list).toHaveBeenCalledTimes(1)
    expect(wrapper.vm.tasks).toEqual([sampleTask])

    wrapper.unmount()
  })

  it('task.* realtime event triggers reload', async () => {
    let calls = 0
    const list = vi.fn(async () => {
      calls++
      return [sampleTask]
    })
    const taskService = {
      list,
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      start: vi.fn(),
      cancel: vi.fn(),
      retry: vi.fn(),
      events: vi.fn(),
    }

    const wrapper = mount(
      defineComponent({
        setup() {
          const events = ref<MissionControlEvent[]>([])
          const composable = useTasks({ taskService, events })
          return { ...composable, events }
        },
        template: '<span />',
      }),
    )

    await wrapper.vm.loadTasks()
    await flushPromises()
    expect(calls).toBe(1)

    wrapper.vm.events.push({
      id: 'e1',
      type: 'task.updated',
      payload: { taskId: 't1' },
      createdAt: new Date().toISOString(),
    })
    await flushPromises()

    expect(calls).toBeGreaterThanOrEqual(2)
    wrapper.unmount()
  })
})
