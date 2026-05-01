/** @vitest-environment happy-dom */
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LogFilters from '../components/logs/LogFilters.vue'

const stubs = {
  UFormField: { template: '<div><slot /></div>', props: ['label'] },
  UInput: { template: '<input disabled />' },
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
})
