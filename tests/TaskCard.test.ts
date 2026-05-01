/** @vitest-environment happy-dom */
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { AgentTask } from '~/models/task'
import TaskCard from '../components/tasks/TaskCard.vue'

const stubs = {
  UCard: {
    template: '<div><slot /></div>',
  },
  TasksTaskStatusBadge: { template: '<span />', props: ['status'] },
  TasksTaskProgressBar: { template: '<div />', props: ['progress'] },
  UButton: {
    inheritAttrs: false,
    props: ['label'],
    template:
      '<button type="button" class="u-btn" v-bind="$attrs">{{ label }}</button>',
  },
}

const baseTask: AgentTask = {
  id: 'tc1',
  title: 'Card',
  status: 'failed',
  priority: 'normal',
  progress: 0,
  createdAt: 'c',
  updatedAt: 'u',
  error: 'boom',
}

describe('TaskCard', () => {
  it('emits retry when Retry clicked', async () => {
    const w = mount(TaskCard, {
      props: { task: baseTask },
      global: { stubs },
    })

    const retry = w.find('[data-testid="task-retry"]')
    expect(retry.exists()).toBe(true)
    await retry.trigger('click')

    expect(w.emitted('retry')).toEqual([['tc1']])

    w.unmount()
  })

  it('emits cancel when Cancel clicked for queued task', async () => {
    const task: AgentTask = { ...baseTask, status: 'queued', error: undefined }
    const w = mount(TaskCard, {
      props: { task },
      global: { stubs },
    })

    const cancel = w.find('[data-testid="task-cancel"]')
    expect(cancel.exists()).toBe(true)
    await cancel.trigger('click')

    expect(w.emitted('cancel')).toEqual([['tc1']])

    w.unmount()
  })
})
