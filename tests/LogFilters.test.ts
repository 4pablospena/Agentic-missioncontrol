/** @vitest-environment happy-dom */
import { mount } from '@vue/test-utils'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'
import LogFilters from '../components/logs/LogFilters.vue'

const stubs = {
  UFormField: {
    props: ['label'],
    template:
      '<label class="flex flex-col gap-1"><span>{{ label }}</span><slot /></label>',
  },
  UInput: {
    props: ['modelValue'],
    template: '<input type="text" disabled :value="modelValue" />',
  },
  UButton: {
    props: ['label'],
    template:
      '<button type="button" class="u-btn" @click="$emit(\'click\')">{{ label }}</button>',
  },
}

describe('LogFilters', () => {
  it('emits apply when Apply clicked', async () => {
    const w = mount(LogFilters, {
      props: {
        modelValue: {},
      },
      global: { stubs },
    })
    const applyBtn = w.findAll('button.u-btn').find(b => b.text().includes('Apply'))
    expect(applyBtn).toBeTruthy()
    await applyBtn!.trigger('click')
    expect(w.emitted('apply')).toBeTruthy()
  })

  it('has no automated axe violations (stubbed UI primitives)', async () => {
    const host = document.createElement('main')
    document.body.append(host)
    const w = mount(LogFilters, {
      attachTo: host,
      props: {
        modelValue: { query: 'error', level: 'warn' },
        agentOptions: [{ label: 'Agent A', value: 'a1' }],
      },
      global: { stubs },
    })
    expect(await axe(host)).toHaveNoViolations()
    w.unmount()
    host.remove()
  })
})
